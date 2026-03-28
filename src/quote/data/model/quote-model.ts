import EffectMessage from "@/common/constants/message/effect"
import EffectPath from "@/common/constants/path/effect"
import { ModelDecoder, ModelField } from "@/lib/effect/model-decoder"
import type ParsingResponseException from "@/utils/exceptions/parsing-response-exception"
import { Effect } from "effect"

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
    private static readonly fields = {
        id: ModelField.number(EffectMessage.INVALID_QUOTE_MODEL_ID),
        quote: ModelField.string(EffectMessage.INVALID_QUOTE_MODEL_QUOTE),
        author: ModelField.string(EffectMessage.INVALID_QUOTE_MODEL_AUTHOR),
    }
    private static readonly fromResponseDecoder = new ModelDecoder<QuoteModelProps, QuoteModel>({
        path: EffectPath.QUOTE_MODEL_FROM_RESPONSE,
        fields: QuoteModel.fields,
        build: (payload) => new QuoteModel(payload),
    })
    private static readonly parseDecoder = new ModelDecoder<QuoteModelProps, QuoteModel>({
        path: EffectPath.QUOTE_MODEL_PARSE,
        fields: QuoteModel.fields,
        build: (payload) => new QuoteModel(payload),
    })

    constructor(param: QuoteModelProps) {
        this.id = param.id
        this.quote = param.quote
        this.author = param.author
    }

    getId = (): number => this.id
    getQuote = (): string => this.quote
    getAuthor = (): string => this.author

    static fromListResponse = (response: QuoteResponseProps[]): QuoteModel[] => {
        if (!response) {
            return []
        }

        return this.fromResponseDecoder.decodeList(response)
    }

    static fromResponse = (response: QuoteResponseProps): QuoteModel => {
        return this.fromResponseDecoder.decode(response)
    }

    static fromResponseEffect = (
        response: QuoteResponseProps
    ): Effect.Effect<QuoteModel, ParsingResponseException, never> => {
        return this.fromResponseDecoder.decodeEffect(response)
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

    static parse = (param: QuoteModelProps): QuoteModel => {
        return this.parseDecoder.decode(param)
    }

    static parseEffect = (
        param: QuoteModelProps
    ): Effect.Effect<QuoteModel, ParsingResponseException, never> => {
        return this.parseDecoder.decodeEffect(param)
    }

    static parseList = (params: QuoteModelProps[]): QuoteModel[] => {
        return this.parseDecoder.decodeList(params)
    }
}
