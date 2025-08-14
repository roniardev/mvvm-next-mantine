import ExceptionType from "@/utils/exceptions"
import GeneralException from "@/utils/exceptions/general-exception"
import ParsingResponseException from "@/utils/exceptions/parsing-response-exception"
import ResponseFormatException from "@/utils/exceptions/response-format-exception"
import UnauthorizedException from "@/utils/exceptions/unauthorized-exception"

export type ErrorModelJSONProps<E> = {
    path: string
    exception: {
        name: string
        message?: string
    }
    data: E
}

export type ErrorModelProps<E> = {
    path: string
    exception: Error
    data: E
}

export default class ErrorModel<E> {
    private path: string
    private exception: Error
    private data: E

    constructor(param: ErrorModelProps<E>) {
        this.path = param.path
        this.exception = param.exception
        this.data = param.data
    }

    getPath = (): string => {
        return this.path
    }

    getException = (): Error => {
        return this.exception
    }

    getData = (): E => {
        return this.data
    }

    toJSON = (): ErrorModelJSONProps<E> => {
        return {
            path: this.path,
            exception: {
                name: this.exception.name,
                message: this.exception.message,
            },
            data: this.data,
        }
    }

    stringifyJSON = (): string => {
        return JSON.stringify(this.toJSON())
    }

    unshiftPath = (path: string): ErrorModel<E> => {
        this.path = `${path} > ${this.path}`

        return new ErrorModel({
            path: this.path,
            exception: this.exception,
            data: this.data,
        })
    }

    static isValidJSON = (param: object) => {
        const keys = Object.keys(param as object)
        const validKeys = ["path", "exception", "data"]
        const foundKeys = keys.filter((key) => {
            return validKeys.find((validKey) => key === validKey)
        })

        return foundKeys.length === validKeys.length
    }

    static parse = <E>(param: ErrorModelJSONProps<E>) => {
        const message = param.exception.message || ""
        let exception: Error = new GeneralException(message)

        if (param.exception.name === ExceptionType.ParsingResponseException) {
            exception = new ParsingResponseException(message)
        }

        if (param.exception.name === ExceptionType.ResponseFormatException) {
            exception = new ResponseFormatException(message)
        }

        if (param.exception.name === ExceptionType.UnauthorizedException) {
            exception = new UnauthorizedException(message)
        }

        return new ErrorModel<E>({
            path: param.path,
            exception: exception,
            data: param.data,
        })
    }
}
