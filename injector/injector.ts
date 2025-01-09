import 'reflect-metadata'
import { Container } from "inversify";
import HomeViewModel, { IHomeViewModel } from '../src/home/view-model/home-view-model';
import { HomeType } from './type.injector';

const container = new Container()

container.bind<IHomeViewModel>(HomeType.HomeViewModel).to(HomeViewModel)
export const homeVM = container.get<IHomeViewModel>(HomeType.HomeViewModel)