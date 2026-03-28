import { inject, injectable } from "inversify"
import Crypto from "@/utils/crypto"
import { QuoteType } from "@/injector/type.injector"
import type QuoteListParam from "../param/quote-list-param"
import ErrorModel, { type ErrorModelJSONProps } from "@/common/models/error-model"
import PaginationModel, { type PaginationModelProps } from "@/common/models/pagination"
import QuoteModel, { type QuoteModelProps } from "../model/quote-model"
import type FetchParam from "@/common/params/fetch-param"
import Either, { type EitherProps } from "@/utils/either"
import { ErrorValidationProps } from "@/common/models/error-validation"

export interface IQuoteRepository {
    queryQuoteList: (param: FetchParam<QuoteListParam>) => Promise<EitherProps<ErrorModel<string | ErrorValidationProps[]>, PaginationModel<QuoteModel>>>
    mutationAddQuote: (quote: QuoteModel) => Promise<EitherProps<Error, string>>
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

    public queryQuoteList = async (param: FetchParam<QuoteListParam>): Promise<EitherProps<ErrorModel<string | ErrorValidationProps[]>, PaginationModel<QuoteModel>>> => {
        try {
            const data = param.getData()
            const serializedParam: string = data ? data.toRequestBody() : ''
            const response: string = await this.getQuoteListRemote(serializedParam)
            const decryptedResponse: string = Crypto.decrypt(response)
            const parsedResponse = JSON.parse(decryptedResponse)
            const isError = ErrorModel.isValidJSON(parsedResponse)

            if (!isError) {
                const paginatedResponse = parsedResponse as PaginationModelProps<QuoteModelProps>
                const data: QuoteModel[] = paginatedResponse.data.map((value) => {
                    return QuoteModel.parse(value)
                })

                const model = new PaginationModel({
                    currentPage: paginatedResponse.currentPage,
                    totalData: paginatedResponse.totalData,
                    totalPage: paginatedResponse.totalPage,
                    data: data,
                })

                return Either.Right(model)
            }

            const error = parsedResponse as ErrorModelJSONProps<any>
            const errorModel = ErrorModel.parse(error).unshiftPath("QuoteRepository:queryQuoteList")
            return Either.Left(errorModel)
        } catch (error) {
            const errorModel = new ErrorModel({
                path: "QuoteRepository:queryQuoteList",
                exception: error instanceof Error ? error : new Error(String(error)),
                data: "Internal error occurred while fetching quote list"
            })
            return Either.Left(errorModel)
        }
    }

    public mutationAddQuote = async (quote: QuoteModel): Promise<EitherProps<Error, string>> => {
        try {
            const result = await this.addQuoteRemote(quote)
            return Either.Right(result)
        } catch (error) {
            return Either.Left(error instanceof Error ? error : new Error(String(error)))
        }
    }
}
