import { inject, injectable } from "inversify"
import Crypto from "@/utils/crypto"
import { QuoteType, GeneralType } from "@/injector/type.injector"
import type QuoteListParam from "../param/quote-list-param"
import ErrorModel, { type ErrorModelJSONProps } from "@/common/models/error-model"
import PaginationModel, { type PaginationModelProps } from "@/common/models/pagination"
import QuoteModel, { type QuoteModelProps } from "../model/quote-model"
import type FetchParam from "@/common/params/fetch-param"
import { QueryFactory } from "@/lib/tanstack-query/query-factory"
import { QueryClientManager } from "@/lib/tanstack-query/query-client-manager"
import { MutationFactory } from "@/lib/tanstack-query/mutation-factory"
import { quoteQueryKeys } from "@/lib/tanstack-query/query-keys"
import type { UseQueryResult, UseMutationResult } from "@tanstack/react-query"
import Either from "@/utils/either"
import { ErrorValidationProps } from "@/common/models/error-validation"

export interface IQuoteRepository {
    queryQuoteList: (param: FetchParam<QuoteListParam>) => UseQueryResult<PaginationModel<QuoteModel>, ErrorModel<string | ErrorValidationProps[]>>
    mutationAddQuote: () => UseMutationResult<string, Error, QuoteModel, unknown>
}

@injectable()
export class QuoteRepository implements IQuoteRepository {
    private getQuoteListRemote: (param: string) => Promise<string>
    private addQuoteRemote: (quote: QuoteModel) => Promise<string>
    private queryFactory: QueryFactory
    private queryClientManager: QueryClientManager
    private mutationFactory: MutationFactory

    constructor(
        @inject(QuoteType.GetQuoteListRemote) getQuoteListRemote: (param: string) => Promise<string>,
        @inject(QuoteType.AddQuoteRemote) addQuoteRemote: (quote: QuoteModel) => Promise<string>,
        @inject(GeneralType.QueryClientManager) queryClientManager: QueryClientManager
    ) {
        this.getQuoteListRemote = getQuoteListRemote
        this.addQuoteRemote = addQuoteRemote
        this.queryClientManager = queryClientManager
        this.queryFactory = new QueryFactory(queryClientManager)
        this.mutationFactory = new MutationFactory(queryClientManager)
    }

    public queryQuoteList = (param: FetchParam<QuoteListParam>): UseQueryResult<PaginationModel<QuoteModel>, ErrorModel<string | ErrorValidationProps[]>> => {
        const path = "QuoteListRepository:queryQuoteList"
        const data = param.getData()
        const serializedParam: string = data ? data.toRequestBody() : ''

        return this.queryFactory.createQuery<PaginationModel<QuoteModel>, ErrorModel<string | ErrorValidationProps[]>>(
            quoteQueryKeys.list(serializedParam),
            async (): Promise<PaginationModel<QuoteModel>> => {
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

                    return model
                }

                const error = parsedResponse as ErrorModelJSONProps<any>
                const model = ErrorModel.parse(error).unshiftPath(path)
                throw model
            },
            {
                staleTime: 5 * 60 * 1000, // 5 MINUTES
                gcTime: 10 * 60 * 1000,  // 10 MINUTES
                refetchOnMount: false,
                refetchOnReconnect: false,
            }
        )
    }

    public mutationAddQuote = () => {
        return this.mutationFactory.createMutation<string, Error, QuoteModel>({
            onMutate: async (quote: QuoteModel) => {
                return await this.addQuoteRemote(quote)
            },
            onSuccess: () => {
                this.queryClientManager.invalidateQueries(quoteQueryKeys.list())
            }
        })
    }
}
