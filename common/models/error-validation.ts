export interface ErrorValidationProps {
    field: string
    message: string
    data?: any
}

export default class ErrorValidation {

    private field: string;
    private message: string;
    private data?: any;

    constructor({ field, message, data }: ErrorValidationProps) {
        this.field = field
        this.message = message
        this.data = data
    }

    public getField(): string {
        return this.field
    }

    public getMessage(): string {
        return this.message
    }

    public getData(): any {
        return this.data;
    }

    public toString(): string {
        return JSON.stringify({
            field: this.field,
            message: this.message,
            data: this.data
        })
    }

    public toJSON(): ErrorValidationProps {
        return {
            field: this.field,
            message: this.message,
            data: this.data
        }
    }
}