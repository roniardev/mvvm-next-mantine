import ExceptionType from ".."

export default class GeneralException implements Error {
    name: string
    message: string

    constructor(message: string) {
        this.message = message
        this.name = ExceptionType.GeneralException
    }
}