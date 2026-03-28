import { inject, injectable } from "inversify"
import type { UseMutationResult, UseQueryResult } from "@tanstack/react-query"
import { useStore } from "zustand"
import { createStore, type StoreApi } from "zustand/vanilla"

import FetchParam from "@/common/params/fetch-param"
import QuoteListParam from "@/src/quote/data/param/quote-list-param"
import { QuoteType, GeneralType } from "@/injector/type.injector"
import type { IQuoteRepository } from "@/src/quote/data/repository/quote-repository"
import type { LoggerInterface } from "@/utils/logger"
import { QueryFactory } from "@/lib/tanstack-query/query-factory"
import { QueryClientManager } from "@/lib/tanstack-query/query-client-manager"
import { MutationFactory } from "@/lib/tanstack-query/mutation-factory"
import { quoteQueryKeys } from "@/lib/tanstack-query/query-keys"
import Either from "@/utils/either"
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
    private logger: LoggerInterface
    private queryFactory: QueryFactory
    private queryClientManager: QueryClientManager
    private mutationFactory: MutationFactory
    private paramStore: StoreApi<QuoteListViewModelState>

    constructor(
        @inject(QuoteType.QuoteRepository) quoteRepository: IQuoteRepository,
        @inject(GeneralType.Logger) logger: LoggerInterface,
        @inject(GeneralType.QueryClientManager) queryClientManager: QueryClientManager
    ) {
        this.quoteRepository = quoteRepository
        this.logger = logger
        this.queryClientManager = queryClientManager
        this.param = new QuoteListParam()
        this.queryFactory = new QueryFactory(queryClientManager)
        this.mutationFactory = new MutationFactory(queryClientManager)
        this.paramStore = createStore<QuoteListViewModelState>(() => ({
            paramVersion: 0,
        }))
        this.param.subscribe(this.handleParamChange)

        this.logger.info("QuoteListViewModel > constructor: ViewModel initialized", {
            path: "QuoteListViewModel > constructor"
        })
    }

    getParam = (): QuoteListParam => this.param

    useQuoteListQuery = (): UseQueryResult<PaginationModel<QuoteModel>, ErrorModel<string | ErrorValidationProps[]>> => {
        this.useParamVersion()

        const path = "QuoteListViewModel > useQuoteListQuery"
        const data = this.getParam()
        const serializedParam: string = data ? data.toRequestBody() : ""

        this.logger.info(`${path}: Starting quote list query`, {
            path,
            serializedParam,
            timestamp: new Date().toISOString()
        })

        return this.queryFactory.createQuery<PaginationModel<QuoteModel>, ErrorModel<string | ErrorValidationProps[]>>(
            quoteQueryKeys.list(serializedParam),
            async (): Promise<PaginationModel<QuoteModel>> => {
                try {
                    this.logger.debug(`${path}: Executing repository quote list call`, {
                        path,
                        serializedParam
                    })

                    const param = new FetchParam({
                        data: this.getParam()
                    })

                    const result = await this.quoteRepository.queryQuoteList(param)

                    if (Either.IsLeft(result)) {
                        console.log("result", "ERROR")
                        const error = Either.UnwrapEither(result)
                        // this.logger.error(`${path}: Quote list query failed with API error`, {
                        //     path,
                        //     error: error.getException().message,
                        //     errorName: error.getException().name,
                        //     serializedParam
                        // })
                        throw error
                    }

                    const data = Either.UnwrapEither(result)
                    // this.logger.info(`${path}: Quote list query successful`, {
                    //     path,
                    //     response: data.toJSON()
                    // })

                    return data
                } catch (error) {
                    // this.logger.error(`${path}: Quote list query failed with exception`, {
                    //     path,
                    //     error: error instanceof Error ? error.message : String(error),
                    //     stack: error instanceof Error ? error.stack : undefined,
                    //     serializedParam
                    // })
                    throw error
                }
            }
        )
    }

    useAddQuoteMutation = (): UseMutationResult<string, Error, QuoteModel, unknown> => {
        const path = "QuoteListViewModel > useAddQuoteMutation"
        this.logger.info(`${path}: Creating add quote mutation`, { path })

        return this.mutationFactory.createMutation<string, Error, QuoteModel>({
            onMutate: async (quote: QuoteModel) => {
                try {
                    this.logger.debug(`${path}: Sending quote to repository`, {
                        path,
                        quoteData: {
                            id: quote.getId(),
                            text: quote.getQuote(),
                            author: quote.getAuthor()
                        }
                    })

                    const result = await this.quoteRepository.mutationAddQuote(quote)

                    if (Either.IsLeft(result)) {
                        const error = Either.UnwrapEither(result)
                        this.logger.error(`${path}: Add quote mutation failed`, {
                            path,
                            quoteId: quote.getId(),
                            error: error.message,
                            stack: error.stack
                        })
                        throw error
                    }

                    const data = Either.UnwrapEither(result)
                    this.logger.info(`${path}: Add quote mutation successful`, {
                        path,
                        response: {
                            quoteId: quote.getId(),
                            result: data,
                            quoteText: quote.getQuote(),
                            quoteAuthor: quote.getAuthor()
                        }
                    })

                    return data
                } catch (error) {
                    this.logger.error(`${path}: Add quote mutation failed with exception`, {
                        path,
                        quoteId: quote.getId(),
                        error: error instanceof Error ? error.message : String(error),
                        stack: error instanceof Error ? error.stack : undefined
                    })
                    throw error
                }
            },
            onSuccess: () => this.queryClientManager.invalidateQueries(quoteQueryKeys.list()),
            onError: (error, variables) => {
                this.logger.error(`${path}: Add quote mutation failed with error`, {
                    path,
                    quoteId: variables.getId(),
                    error: error.message,
                    stack: error.stack
                })
            }
        })
    }

    handleError = (error: Error) => {
        const path = "QuoteListViewModel > handleError"
        this.logger.error(`${path}: Error occurred in QuoteListViewModel`, {
            path,
            error: error.message,
            stack: error.stack
        })
        return error.message || 'Terjadi kesalahan saat mengambil data quotes'
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
