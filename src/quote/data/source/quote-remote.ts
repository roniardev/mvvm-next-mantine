"use server"

import CustomResponse from "@/common/models/custom-response"
import PaginationModel from "@/common/models/pagination"
import Either from "@/utils/either"
import ErrorModel from "@/common/models/error-model"
import Crypto from "@/utils/crypto"
import GeneralException from "@/utils/exceptions/general-exception"
import QuoteModel, { QuoteResponseProps } from "../model/quote-model"

export const getQuoteListRemote = async (param: string): Promise<string> => {
    const path = "QuoteListRemote:getQuoteList"

    try {
        const controller = new AbortController()
        const timeout = setTimeout(() => controller.abort(), 10000)

        const response = await fetch(`http://localhost:3000/api/quotes`, {
            method: "GET",
            signal: controller.signal,
            headers: {
                "Content-Type": "application/json",
            },
        })

        clearTimeout(timeout)

        const customerResponse = await CustomResponse.eitherResponse({
            response,
            onSuccess: ({ data }) => {
                const decryptedJSONData = JSON.parse(JSON.parse(Crypto.decrypt(data as string)))
                const paginatedData = PaginationModel.fromResponse({
                    response: decryptedJSONData,
                    parseData: (data: QuoteResponseProps[]) => data.map((item: QuoteResponseProps) => QuoteModel.fromResponse(item)),
                })

                return Either.Right(paginatedData)
            },
            onError: ({ message }) => {
                return Either.Left(
                    new ErrorModel({
                        path,
                        exception: new GeneralException(message),
                        data: null,
                    })
                )
            },
        })

        const result = Either.UnwrapEither(customerResponse)
        return Crypto.encrypt(result.stringifyJSON())
    } catch (error: any) {
        const customResponse = Either.Left(
            new ErrorModel({
                path,
                exception: new GeneralException(error.message),
                data: null,
            })
        )

        const result = Either.UnwrapEither(customResponse)
        return Crypto.encrypt(result.stringifyJSON())
    }
}

export const addQuoteRemote = async (quote: QuoteModel): Promise<string> => {
    const path = "QuoteListRemote:addQuote"

    try {
        const controller = new AbortController()
        const timeout = setTimeout(() => controller.abort(), 10000)

        const response = await fetch(`http://localhost:3000/api/quotes`, {
            method: "POST",
            signal: controller.signal,
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(quote.toJSON()),
        })

        clearTimeout(timeout)

        const customerResponse = await CustomResponse.eitherResponse({
            response,
            onSuccess: ({ data }) => {
                return Either.Right(data)
            },
            onError: ({ message }) => {
                return Either.Left(
                    new ErrorModel({
                        path,
                        exception: new GeneralException(message),
                        data: null,
                    })
                )
            },
        })

        const result = Either.UnwrapEither(customerResponse)
        return Crypto.encrypt(JSON.stringify(result))
    } catch (error: any) {
        const customResponse = Either.Left(
            new ErrorModel({
                path,
                exception: new GeneralException(error.message),
                data: null,
            })
        )

        const result = Either.UnwrapEither(customResponse)
        return Crypto.encrypt(result.stringifyJSON())
    }
}


