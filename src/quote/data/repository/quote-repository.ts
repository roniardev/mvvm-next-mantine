import EffectMessage from "@/common/constants/message/effect"
import EffectPath from "@/common/constants/path/effect"
import ErrorModel from "@/common/models/error-model"
import { ErrorValidationProps } from "@/common/models/error-validation"
import PaginationModel, { type PaginationModelProps } from "@/common/models/pagination"
import type FetchParam from "@/common/params/fetch-param"
import { QuoteType } from "@/injector/type.injector"
import { effectHelper } from "@/lib/effect/effect-helpers"
import QuoteModel, { type QuoteModelProps } from "@/src/quote/data/model/quote-model"
import type { EitherProps } from "@/utils/either"
import { inject, injectable } from "inversify"
import { Effect } from "effect"

import type QuoteListParam from "../param/quote-list-param"

export interface IQuoteRepository {
    queryQuoteList: (param: FetchParam<QuoteListParam>) => Promise<EitherProps<ErrorModel<string | ErrorValidationProps[]>, PaginationModel<QuoteModel>>>
    mutationAddQuote: (quote: QuoteModel) => Promise<EitherProps<Error, string>>
}

const buildQuotePaginationModel = (parsedResponse: unknown): PaginationModel<QuoteModel> => {
    const paginatedResponse = parsedResponse as PaginationModelProps<QuoteModelProps>

    return new PaginationModel({
        currentPage: paginatedResponse.currentPage,
        totalData: paginatedResponse.totalData,
        totalPage: paginatedResponse.totalPage,
        data: QuoteModel.parseList(paginatedResponse.data),
    })
}

const parseMutationResponse = (parsedResponse: unknown): string => {
    if (typeof parsedResponse === "string") {
        return parsedResponse
    }

    return JSON.stringify(parsedResponse)
}

@injectable()
export class QuoteRepository implements IQuoteRepository {
    private getQuoteListRemote: (param: string) => Promise<string>
    private addQuoteRemote: (quote: QuoteModel) => Promise<string>

    constructor(
        @inject(QuoteType.GetQuoteListRemote) getQuoteListRemote: (param: string) => Promise<string>,
        @inject(QuoteType.AddQuoteRemote) addQuoteRemote: (quote: QuoteModel) => Promise<string>
    ) {
        this.getQuoteListRemote = getQuoteListRemote
        this.addQuoteRemote = addQuoteRemote
    }

    public queryQuoteList = (param: FetchParam<QuoteListParam>): Promise<EitherProps<ErrorModel<string | ErrorValidationProps[]>, PaginationModel<QuoteModel>>> => {
        const repository = this
        const data = param.getData()
        let serializedParam = ""

        if (data) {
            serializedParam = data.toRequestBody()
        }

        const effect = effectHelper.tryPromise<string, string | ErrorValidationProps[]>({
            path: EffectPath.QUOTE_REPOSITORY_QUERY,
            message: EffectMessage.FAILED_TO_REQUEST_QUOTE_LIST_REMOTE_SOURCE,
            errorData: EffectMessage.INTERNAL_ERROR_WHILE_FETCHING_QUOTE_LIST,
            try: () => repository.getQuoteListRemote(serializedParam),
        }).pipe(
            Effect.flatMap((response) =>
                effectHelper.decodeEncryptedRemote<PaginationModel<QuoteModel>, string | ErrorValidationProps[]>({
                    path: EffectPath.QUOTE_REPOSITORY_QUERY,
                    response,
                    errorData: EffectMessage.INTERNAL_ERROR_WHILE_FETCHING_QUOTE_LIST,
                    decryptMessage: EffectMessage.FAILED_TO_DECRYPT_QUOTE_LIST_RESPONSE,
                    parseMessage: EffectMessage.FAILED_TO_PARSE_QUOTE_LIST_RESPONSE,
                    successMessage: EffectMessage.FAILED_TO_BUILD_QUOTE_LIST_MODEL,
                    parseSuccess: buildQuotePaginationModel,
                })
            )
        )

        return effectHelper.runAsEither(effect)
    }

    public mutationAddQuote = (quote: QuoteModel): Promise<EitherProps<Error, string>> => {
        const repository = this
        const effect = effectHelper.tryPromise<string, string>({
            path: EffectPath.QUOTE_REPOSITORY_ADD,
            message: EffectMessage.FAILED_TO_REQUEST_ADD_QUOTE_REMOTE_SOURCE,
            errorData: EffectMessage.INTERNAL_ERROR_WHILE_ADDING_QUOTE,
            try: () => repository.addQuoteRemote(quote),
        }).pipe(
            Effect.flatMap((response) =>
                effectHelper.decodeEncryptedRemote<string, string>({
                    path: EffectPath.QUOTE_REPOSITORY_ADD,
                    response,
                    errorData: EffectMessage.INTERNAL_ERROR_WHILE_ADDING_QUOTE,
                    decryptMessage: EffectMessage.FAILED_TO_DECRYPT_ADD_QUOTE_RESPONSE,
                    parseMessage: EffectMessage.FAILED_TO_PARSE_ADD_QUOTE_RESPONSE,
                    successMessage: EffectMessage.FAILED_TO_BUILD_ADD_QUOTE_RESULT,
                    parseSuccess: parseMutationResponse,
                })
            ),
            Effect.mapError((error) => error.getException())
        )

        return effectHelper.runAsEither(effect)
    }
}
