import Crypto from "@/utils/crypto"

export type QuoteListRequestProps = {
    q?: string
    page: number
    limit: number
    size?: string
}

export type QuoteListParamProps = {
    q?: string
    page: number
    limit: number
    size?: string
}

export default class QuoteListParam {
    private q?: string
    private page: number
    private limit: number
    private size?: string
  
    constructor(param?: QuoteListParamProps) {
        this.q = param?.q ?? ""
        this.page = param?.page ?? 0
        this.limit = param?.limit ?? 20
        this.size = param?.size ?? ""
    }

    getQ = (): string | undefined => {
        return this.q;
    }

    setQ = (q?: string): void => {
        this.q = q;
    }

    getPage = (): number => {
        return this.page;
    }

    setPage = (page: number): void => {
        this.page = page;
    }

    getLimit = (): number => {
        return this.limit;
    }

    setLimit = (limit: number): void => {
        this.limit = limit;
    }

    getSize = (): string | undefined => {
        return this.size;
    }

    setSize = (size: string): void => {
        this.size = size;
    }

    toJSON = () => {
        return {
            q: this.q,
            page: this.page,
            limit: this.limit,
            size: this.size,
        }
    }

    toRequestBody = (): string => {
        const data: QuoteListRequestProps = {
            q: this.q,
            page: this.page,
            limit: this.limit,
            size: this.size,
        }

        return JSON.stringify(data)
    }

    encrypt = () => {
        return Crypto.encrypt(JSON.stringify(this.toJSON()))
    }

    static decrypt = (encrypted: string) => {
        const decryptedBodyParam = Crypto.decrypt(encrypted)
        const parsedParam = JSON.parse(decryptedBodyParam)
        return this.parse(parsedParam)
    }

    static parse = (param: QuoteListParamProps) => {
        return new QuoteListParam({
            q: param.q,
            page: param.page,
            limit: param.limit,
            size: param.size,
        })
    }
}