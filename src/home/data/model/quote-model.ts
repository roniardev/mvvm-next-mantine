import ParsingResponseException from "@/utils/exceptions/parsing-response-exception"

export type QuoteResponseProps = {
    id: number
    quote: string
    author: string
}

export type QuoteModelProps = {
    id: number
    quote: string
    author: string
}

export default class QuoteModel {
    private id: number
    private quote: string
    private author: string

    constructor(param: QuoteModelProps) {
        this.id = param.id
        this.quote = param.quote
        this.author = param.author
    }

    getId = (): number => {
        return this.id
    }

    getQuote = (): string => {
        return this.quote
    }

    getAuthor = (): string => {
        return this.author
    }

    static fromListResponse = (response: QuoteResponseProps[]): QuoteModel[] => {
        if (!response) {
            return []
        }

        return response.map((item) => this.fromResponse(item))
    }

    static fromResponse = (response: QuoteResponseProps): QuoteModel => {
        try {
            return new QuoteModel({
                id: response.id,
                quote: response.quote,
                author: response.author
            })
        } catch (error) {
            throw new ParsingResponseException(error)
        }
    }

    toJSON = (): QuoteModelProps => {
        return {
            id: this.id,
            quote: this.quote,
            author: this.author
        }
    }

    stringifyJSON = (): string => {
        return JSON.stringify(this.toJSON())
    }

    static parse = (param: QuoteModelProps) => {
        return new QuoteModel({
            id: param.id,
            quote: param.quote,
            author: param.author
        })
    }

    static parseList = (params: QuoteModelProps[]) => {
        return params.map((param) => this.parse(param))
    }
}