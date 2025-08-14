import "reflect-metadata"
import { Container } from "inversify"
import { QuoteListViewModel } from "@/src/quote/view-model/quote-list-view-model";
import { QuoteType, HomeType, GeneralType } from "./type.injector";
import { getQuoteListRemote, addQuoteRemote } from "@/src/quote/data/source/quote-remote";

import { QueryClientManager } from "@/lib/tanstack-query/query-client-manager";
import QuoteModel from "@/src/quote/data/model/quote-model"
import { QuoteRepository } from "@/src/quote/data/repository/quote-repository"

const container = new Container();

// Register common services
container.bind(GeneralType.QueryClientManager).to(QueryClientManager).inSingletonScope();

// Register repositories
container.bind(QuoteType.QuoteRepository).to(QuoteRepository).inSingletonScope();

// Register remote sources
container.bind<(param: string) => Promise<string>>(QuoteType.GetQuoteListRemote).toFunction(getQuoteListRemote);
container.bind<(quote: QuoteModel) => Promise<string>>(QuoteType.AddQuoteRemote).toFunction(addQuoteRemote);

// Register view models
container.bind(QuoteType.QuoteListViewModel).to(QuoteListViewModel).inSingletonScope();

// Export view model instances
export const quoteVM = container.get<QuoteListViewModel>(QuoteType.QuoteListViewModel);

export default container;