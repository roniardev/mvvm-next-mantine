import Crypto from "@/utils/crypto"

export type FetchParamProps<T = undefined> = {
    data?: T
}

export default class FetchParam<T = undefined> {
    private data?: T

    constructor(param: FetchParamProps<T>) {
        this.data = param.data
    }
    getData = () => {
        return this.data
    }

    toJSON = () => {
        let payload = {}
        if (this.data) {
            const result = this.data as unknown as { toJSON: () => unknown }
            payload = {
                data: result.toJSON(),
            }
        }

        return {
            ...payload,
        }
    }

    encryptJSON = (): string => {
        return Crypto.encrypt(JSON.stringify(this.toJSON()))
    }

    toRequestBody = (): string | undefined => {
        if (!this.data) {
            return undefined
        }

        const result = this.data as unknown as { toRequestBody: () => unknown }
        const data = result.toRequestBody()
        if (typeof data !== "string") {
            return data as string
        }

        return JSON.stringify({
            payload: Crypto.encrypt(result.toRequestBody() as string),
        })
    }

    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    static decryptJSON = <T = undefined>(encryptedParam: string, parser?: (param: any) => T): FetchParam<T> => {
        const decryptedBodyParam = Crypto.decrypt(encryptedParam)
        const parsedParam = JSON.parse(decryptedBodyParam)
        if (parser) {
            parsedParam.data = parser(parsedParam.data)
            return this.parse(parsedParam)
        }

        return this.parse(parsedParam)
    }

    static parse = <T = undefined>(param: FetchParamProps<T>): FetchParam<T> => {
        return new FetchParam({
            data: param.data,
        })
    }
}
