import { inject, injectable } from "inversify"
import { makeAutoObservable } from "mobx"

import FetchParam from "@/common/params/fetch-param"
import QuoteListParam from "@/src/quote/data/param/quote-list-param"
import { QuoteType } from "@/injector/type.injector"
import type { IQuoteRepository } from "@/src/quote/data/repository/quote-repository"

export interface IQuoteListViewModel {
    getParam: () => QuoteListParam
    useQuoteListQuery: () => ReturnType<IQuoteRepository['queryQuoteList']>
    useAddQuoteMutation: () => ReturnType<IQuoteRepository['mutationAddQuote']>
}

@injectable()
export class QuoteListViewModel implements IQuoteListViewModel {
    private quoteRepository: IQuoteRepository
    private param: QuoteListParam

    constructor(
        @inject(QuoteType.QuoteRepository) quoteRepository: IQuoteRepository
    ) {
        this.quoteRepository = quoteRepository
        this.param = new QuoteListParam()

        makeAutoObservable(this)
    }

    getParam = (): QuoteListParam => this.param

    useQuoteListQuery = () => {
        const param = new FetchParam({
            data: this.getParam()
        })

        return this.quoteRepository.queryQuoteList(param)
    }

    useAddQuoteMutation = () =>this.quoteRepository.mutationAddQuote()

    handleError = (error: Error) => {
        return error.message || 'Terjadi kesalahan saat mengambil data quotes'
    }
}