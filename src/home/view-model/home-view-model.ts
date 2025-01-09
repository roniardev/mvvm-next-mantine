import { makeAutoObservable } from "mobx";

export interface IHomeViewModel {
	getCount(): number;
	incrementCount(): void;
	decrementCount(): void;
}

export default class HomeViewModel implements IHomeViewModel {
	private count: number;

	constructor() {
		this.count = 0;

		makeAutoObservable(this)
	}

	getCount() {
		return this.count;
	}

	incrementCount() {
		this.count++;
	}

    decrementCount() {
        if (this.count <= 0) return;
        this.count--;
    }
}
