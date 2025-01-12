import ExceptionType from ".."

export default class ParsingResponseException implements Error {
    name: string
    message: string

    constructor(message: unknown) {
        this.message = message as string
        this.name = ExceptionType.ParsingResponseException
    }
}