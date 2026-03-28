import { inject, injectable } from "inversify"
import type { UseMutationResult, UseQueryResult } from "@tanstack/react-query"
import { useStore } from "zustand"
import { createStore, type StoreApi } from "zustand/vanilla"

import FetchParam from "@/common/params/fetch-param"
import QuoteListParam from "@/src/quote/data/param/quote-list-param"
import { QuoteType, GeneralType } from "@/injector/type.injector"
import type { IQuoteRepository } from "@/src/quote/data/repository/quote-repository"
import type { LoggerInterface } from "@/utils/logger"
import { QueryClientManager } from "@/lib/tanstack-query/query-client-manager"
import { quoteQueryKeys } from "@/lib/tanstack-query/query-keys"
import { ViewModelQueryFactory } from "@/lib/tanstack-query/view-model-query-factory"
import PaginationModel from "@/common/models/pagination"
import QuoteModel from "@/src/quote/data/model/quote-model"
import ErrorModel from "@/common/models/error-model"
import { ErrorValidationProps } from "@/common/models/error-validation"

type QuoteListViewModelState = {
    paramVersion: number
}

export interface IQuoteListViewModel {
    getParam: () => QuoteListParam
    useQuoteListQuery: () => UseQueryResult<PaginationModel<QuoteModel>, ErrorModel<string | ErrorValidationProps[]>>
    useAddQuoteMutation: () => UseMutationResult<string, Error, QuoteModel, unknown>
}

@injectable()
export class QuoteListViewModel implements IQuoteListViewModel {
    private quoteRepository: IQuoteRepository
    private param: QuoteListParam
    private queryFactory: ViewModelQueryFactory
    private paramStore: StoreApi<QuoteListViewModelState>

    constructor(
        @inject(QuoteType.QuoteRepository) quoteRepository: IQuoteRepository,
        @inject(GeneralType.Logger) logger: LoggerInterface,
        @inject(GeneralType.QueryClientManager) queryClientManager: QueryClientManager
    ) {
        this.quoteRepository = quoteRepository
        this.param = new QuoteListParam()
        this.queryFactory = new ViewModelQueryFactory(queryClientManager, logger)
        this.paramStore = createStore<QuoteListViewModelState>(() => ({
            paramVersion: 0,
        }))
        this.param.subscribe(this.handleParamChange)
    }

    getParam = (): QuoteListParam => this.param

    useQuoteListQuery = (): UseQueryResult<PaginationModel<QuoteModel>, ErrorModel<string | ErrorValidationProps[]>> => {
        this.useParamVersion()

        const path = "QuoteListViewModel > useQuoteListQuery"
        const data = this.getParam()
        const serializedParam: string = data ? data.toRequestBody() : ""

        return this.queryFactory.useEitherQuery<PaginationModel<QuoteModel>, ErrorModel<string | ErrorValidationProps[]>>({
            path,
            key: quoteQueryKeys.list(serializedParam),
            meta: () => ({
                serializedParam,
            }),
            request: async () => {
                const param = new FetchParam({
                    data: this.getParam()
                })

                return this.quoteRepository.queryQuoteList(param)
            },
        })
    }

    useAddQuoteMutation = (): UseMutationResult<string, Error, QuoteModel, unknown> => {
        return this.queryFactory.useEitherMutation<string, Error, QuoteModel>({
            path: "QuoteListViewModel > useAddQuoteMutation",
            invalidateKeys: [quoteQueryKeys.list()],
            meta: ({ variables }) => ({
                quoteId: variables.getId(),
                quoteText: variables.getQuote(),
                quoteAuthor: variables.getAuthor(),
            }),
            request: (quote: QuoteModel) => {
                return this.quoteRepository.mutationAddQuote(quote)
            },
        })
    }

    private useParamVersion = (): number => {
        return useStore(this.paramStore, (state) => state.paramVersion)
    }

    private handleParamChange = (): void => {
        this.paramStore.setState((state) => ({
            paramVersion: state.paramVersion + 1,
        }))
    }
}
