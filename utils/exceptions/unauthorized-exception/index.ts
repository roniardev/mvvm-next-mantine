import ExceptionType from ".."

export default class UnauthorizedException implements Error {
    name: string
    message: string

    constructor(message: string) {
        this.message = message
        this.name = ExceptionType.UnauthorizedException
    }
}