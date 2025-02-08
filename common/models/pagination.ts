
export interface PaginationResponseProps<T> {
    current_page: number
    total_data: number
    total_page: number
    data: T[]
}

export interface PaginationModelProps<T> {
    currentPage: number
    totalData: number
    totalPage: number
    data: T[]
}

export default class PaginationModel<T> {
    private currentPage: number
    private data: T[]
    private totalData: number
    private totalPage: number

    constructor({ currentPage, data, totalData, totalPage }: PaginationModelProps<T>) {
        this.currentPage = currentPage
        this.data = data
        this.totalData = totalData
        this.totalPage = totalPage
    }

    getCurrentPage = () => this.currentPage

    getData = () => this.data

    getTotalData = () => this.totalData

    getTotalPage = () => this.totalPage

    setCurrentPage = (page: number) => {
        this.currentPage = page
    }

    setData = (items: T[]) => {
        this.data = items
    }

    setTotalData = (total: number) => {
        this.totalData = total
    }

    setTotalPage = (total: number) => {
        this.totalPage = total
    }

    toJSON = <K>(): PaginationModelProps<K> => {
        return {
            currentPage: this.currentPage,
            data: this.data.map((item) => {
                // biome-ignore lint/suspicious/noExplicitAny: <explanation>
                const result = item as any
                
                return result.toJSON()
            }),
            totalData: this.totalData,
            totalPage: this.totalPage
        }
    }

    stringifyJSON = (): string => {
        return JSON.stringify(this.toJSON())
    }

    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    static fromResponse = <T>(param: { response: PaginationResponseProps<T>, parseData: (data: any) => T[] }) => {
        return new PaginationModel<T>({
            currentPage: param.response.current_page,
            data: param.parseData(param.response.data),
            totalData: param.response.total_data,
            totalPage: param.response.total_page
        })
    }

}