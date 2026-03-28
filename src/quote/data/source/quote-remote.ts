"use server"

import EffectMessage from "@/common/constants/message/effect"
import EffectPath from "@/common/constants/path/effect"
import CustomResponse from "@/common/models/custom-response"
import ErrorModel from "@/common/models/error-model"
import PaginationModel from "@/common/models/pagination"
import { effectHelper } from "@/lib/effect/effect-helpers"
import Crypto from "@/utils/crypto"
import Either, { type EitherProps } from "@/utils/either"
import GeneralException from "@/utils/exceptions/general-exception"
import { Effect } from "effect"

import QuoteModel, { type QuoteResponseProps } from "../model/quote-model"

const QUOTE_REMOTE_TIMEOUT_MS = 10000

type QuoteListRequestPayload = {
    q?: string
    page?: number
    limit?: number
    size?: string
}

type QuoteListApiResponse = {
    data: QuoteResponseProps[]
    total: number
    page: number
    limit: number
}

const createRemoteError = (path: string, message: string): ErrorModel<null> => {
    return new ErrorModel({
        path,
        exception: new GeneralException(message),
        data: null,
    })
}

const parseQuoteListRequest = (param: string): QuoteListRequestPayload => {
    if (!param) {
        return {
            page: 0,
            limit: 20,
        }
    }

    return JSON.parse(param) as QuoteListRequestPayload
}

const buildQuoteListUrl = (param: QuoteListRequestPayload): string => {
    const url = new URL("http://localhost:3000/api/quotes")

    if (param.q) {
        url.searchParams.set("q", param.q)
    }

    if (param.page !== undefined) {
        url.searchParams.set("page", String(param.page))
    }

    if (param.limit !== undefined) {
        url.searchParams.set("limit", String(param.limit))
    }

    return url.toString()
}

const buildQuotePagination = (payload: QuoteListApiResponse): PaginationModel<QuoteModel> => {
    let limit = payload.limit

    if (limit <= 0) {
        limit = Math.max(payload.data.length, 1)
    }

    const totalPage = Math.max(1, Math.ceil(payload.total / limit))

    return new PaginationModel({
        currentPage: payload.page,
        totalData: payload.total,
        totalPage,
        data: QuoteModel.fromListResponse(payload.data),
    })
}

const getQuoteListRemoteEffect = (param: string): Effect.Effect<PaginationModel<QuoteModel>, ErrorModel<null>, never> => {
    return effectHelper.trySync<QuoteListRequestPayload, null>({
        path: EffectPath.QUOTE_LIST_REMOTE_GET,
        message: EffectMessage.INVALID_QUOTE_LIST_REQUEST_PAYLOAD,
        errorData: null,
        try: () => parseQuoteListRequest(param),
    }).pipe(
        Effect.flatMap((requestParam) =>
            effectHelper.tryPromise<Response, null>({
                path: EffectPath.QUOTE_LIST_REMOTE_GET,
                message: EffectMessage.FAILED_TO_FETCH_QUOTE_LIST,
                errorData: null,
                try: () =>
                    fetch(buildQuoteListUrl(requestParam), {
                        method: "GET",
                        signal: AbortSignal.timeout(QUOTE_REMOTE_TIMEOUT_MS),
                        headers: {
                            "Content-Type": "application/json",
                        },
                    }),
            })
        ),
        Effect.flatMap((response) =>
            effectHelper.tryPromise<EitherProps<ErrorModel<null>, PaginationModel<QuoteModel>>, null>({
                path: EffectPath.QUOTE_LIST_REMOTE_GET,
                message: EffectMessage.FAILED_TO_DECODE_QUOTE_LIST_RESPONSE,
                errorData: null,
                try: () =>
                    CustomResponse.eitherResponse({
                        response,
                        onSuccess: ({ data }) => {
                            const payload = JSON.parse(JSON.parse(Crypto.decrypt(String(data)))) as QuoteListApiResponse
                            return Either.Right(buildQuotePagination(payload))
                        },
                        onError: ({ message }) => Either.Left(createRemoteError(EffectPath.QUOTE_LIST_REMOTE_GET, message)),
                    }),
            })
        ),
        Effect.flatMap((result) => effectHelper.fromEither(result))
    )
}

const parseAddQuoteSuccessData = (data: unknown): string => {
    if (typeof data === "string") {
        return data
    }

    return JSON.stringify(data)
}

const addQuoteRemoteEffect = (quote: QuoteModel): Effect.Effect<string, ErrorModel<null>, never> => {
    return effectHelper.tryPromise<Response, null>({
        path: EffectPath.QUOTE_LIST_REMOTE_ADD,
        message: EffectMessage.FAILED_TO_ADD_QUOTE,
        errorData: null,
        try: () =>
            fetch("http://localhost:3000/api/quotes", {
                method: "POST",
                signal: AbortSignal.timeout(QUOTE_REMOTE_TIMEOUT_MS),
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(quote.toJSON()),
            }),
    }).pipe(
        Effect.flatMap((response) =>
            effectHelper.tryPromise<EitherProps<ErrorModel<null>, string>, null>({
                path: EffectPath.QUOTE_LIST_REMOTE_ADD,
                message: EffectMessage.FAILED_TO_DECODE_ADD_QUOTE_RESPONSE,
                errorData: null,
                try: () =>
                    CustomResponse.eitherResponse({
                        response,
                        onSuccess: ({ data }) => Either.Right(parseAddQuoteSuccessData(data)),
                        onError: ({ message }) => Either.Left(createRemoteError(EffectPath.QUOTE_LIST_REMOTE_ADD, message)),
                    }),
            })
        ),
        Effect.flatMap((result) => effectHelper.fromEither(result))
    )
}

export const getQuoteListRemote = async (param: string): Promise<string> => {
    return effectHelper.runEncryptedRemote({
        path: EffectPath.QUOTE_LIST_REMOTE_GET,
        effect: getQuoteListRemoteEffect(param),
        errorData: null,
        serializeSuccess: (result) => result.stringifyJSON(),
        fallbackMessage: EffectMessage.INTERNAL_ERROR_WHILE_FETCHING_QUOTE_LIST,
    })
}

export const addQuoteRemote = async (quote: QuoteModel): Promise<string> => {
    return effectHelper.runEncryptedRemote({
        path: EffectPath.QUOTE_LIST_REMOTE_ADD,
        effect: addQuoteRemoteEffect(quote),
        errorData: null,
        serializeSuccess: (result) => JSON.stringify(result),
        fallbackMessage: EffectMessage.INTERNAL_ERROR_WHILE_ADDING_QUOTE,
    })
}
