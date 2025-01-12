import ExceptionType from ".."

export default class ResponseFormatException implements Error {
    name: string
    message: string

    constructor(message: string) {
        this.message = message
        this.name = ExceptionType.ResponseFormatException
    }
}