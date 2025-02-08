import 'reflect-metadata'
import { Container } from "inversify";
import HomeViewModel, { type IHomeViewModel } from '../src/home/view-model/home-view-model';
import { HomeType, GeneralType } from './type.injector';
import { QueryClientManager, type IQueryClientManager } from '@/lib/tanstack-query/query-client-manager';

const container = new Container()

// GENERAL
container.bind<IQueryClientManager>(GeneralType.QueryClientManager).to(QueryClientManager).inSingletonScope()

// HOME VM
container.bind<IHomeViewModel>(HomeType.HomeViewModel).to(HomeViewModel)
export const homeVM = container.get<IHomeViewModel>(HomeType.HomeViewModel)