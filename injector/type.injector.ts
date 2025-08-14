export const HomeType = {
    HomeViewModel: Symbol.for("HomeViewModel"),
}

export const QuoteType = {
    QuoteRepository: Symbol.for("QuoteRepository"),
    GetQuoteListRemote: Symbol.for("GetQuoteListRemote"),
    AddQuoteRemote: Symbol.for("AddQuoteRemote"),
    QuoteListViewModel: Symbol.for("QuoteListViewModel"),
}

export const GeneralType = {
    QueryClientManager: Symbol.for("QueryClientManager"),
}
