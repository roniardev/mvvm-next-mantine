import Message from "@/common/constants/message"
import { EitherProps, LeftProps, RightProps } from "@/utils/either"
import ResponseFormatException from "@/utils/exceptions/response-format-exception"
import UnauthorizedException from "@/utils/exceptions/unauthorized-exception"

export type CustomResponseProps<E = undefined> = {
    status: boolean
    message: string
    data?: E
}

type ResponseResult = {
    status: boolean
    message: string
    data: string | Record<string, unknown | number | boolean | unknown[]>
}

type FromResponseProps<T, U> = {
    response: Response
    onError: (result: ResponseResult) => LeftProps<T>
    onSuccess: (result: ResponseResult) => RightProps<U>
}

export default class CustomResponse<E = undefined> {
    private status: boolean
    private message: string
    private data?: E

    constructor({ status, message, data }: CustomResponseProps<E>) {
        this.status = status
        this.message = message
        this.data = data
    }

    getStatus = (): boolean => {
        return this.status
    }

    getMessage = (): string => {
        return this.message
    }

    getData = (): E | undefined => {
        return this.data
    }

    toJSON = (): CustomResponseProps<E> => {
        return {
            status: this.status,
            message: this.message,
            data: this.data,
        }
    }

    static parse = <E>(param: CustomResponseProps<E>): CustomResponse<E> => {
        return new CustomResponse({
            status: param.status,
            message: param.message,
            data: param.data,
        })
    }

    static checkResponse = (response: CustomResponseProps): boolean => {
        return response.status !== undefined && response.message !== undefined && response.data !== undefined
    }

    static eitherResponse = async <T, U>(param: FromResponseProps<T, U>): Promise<EitherProps<T, U>> => {
        const result = await param.response.json()

        if (!this.checkResponse(result)) {
            throw new ResponseFormatException(JSON.stringify(result))
        }

        const status = result.status
        const message = result.message

        if (status) {
            return param.onSuccess(result)
        }

        if (message === Message.UNAUTHENTICATED_ERROR) {
            throw new UnauthorizedException(message)
        }

        return param.onError(result)
    }
}
