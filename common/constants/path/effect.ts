const EffectPath = {
    QUOTE_MODEL_FROM_RESPONSE: "QuoteModel:fromResponse",
    QUOTE_MODEL_PARSE: "QuoteModel:parse",
    QUOTE_LIST_REMOTE_GET: "QuoteListRemote:getQuoteList",
    QUOTE_LIST_REMOTE_ADD: "QuoteListRemote:addQuote",
    QUOTE_REPOSITORY_QUERY: "QuoteRepository:queryQuoteList",
    QUOTE_REPOSITORY_ADD: "QuoteRepository:mutationAddQuote",
} as const

export default EffectPath
