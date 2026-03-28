import { getModelParsingMessage } from "@/common/constants/message/effect"
import ParsingResponseException from "@/utils/exceptions/parsing-response-exception"
import { Effect } from "effect"

export type ModelFieldDecoder<TValue> = (
    value: unknown,
    path: string
) => Effect.Effect<TValue, ParsingResponseException, never>

export type ModelInput<TShape> = {
    [TKey in keyof TShape]: unknown
}

type ModelDecoderConfig<TShape extends Record<string, unknown>, TModel> = {
    path: string
    fields: {
        [TKey in keyof TShape]: ModelFieldDecoder<TShape[TKey]>
    }
    build: (payload: TShape) => TModel
}

export class ModelField {
    private static createParsingResponseError(
        path: string,
        message: string
    ): ParsingResponseException {
        return new ParsingResponseException(getModelParsingMessage(path, message))
    }

    static string(message: string): ModelFieldDecoder<string> {
        return (value, path) => {
            if (typeof value !== "string") {
                return Effect.fail(this.createParsingResponseError(path, message))
            }

            return Effect.succeed(value)
        }
    }

    static number(message: string): ModelFieldDecoder<number> {
        return (value, path) => {
            if (typeof value !== "number") {
                return Effect.fail(this.createParsingResponseError(path, message))
            }

            if (!Number.isFinite(value)) {
                return Effect.fail(this.createParsingResponseError(path, message))
            }

            return Effect.succeed(value)
        }
    }
}

export class ModelDecoder<
    TShape extends Record<string, unknown>,
    TModel
> {
    private readonly path: string
    private readonly fields: ModelDecoderConfig<TShape, TModel>["fields"]
    private readonly build: (payload: TShape) => TModel

    constructor(config: ModelDecoderConfig<TShape, TModel>) {
        this.path = config.path
        this.fields = config.fields
        this.build = config.build
    }

    decodeEffect = (
        input: ModelInput<TShape>
    ): Effect.Effect<TModel, ParsingResponseException, never> => {
        return this.decodeShapeEffect(input).pipe(
            Effect.map((payload) => this.build(payload))
        )
    }

    decode = (input: ModelInput<TShape>): TModel => {
        return this.runSync(this.decodeEffect(input))
    }

    decodeListEffect = (
        input: ModelInput<TShape>[]
    ): Effect.Effect<TModel[], ParsingResponseException, never> => {
        return Effect.all(input.map((item) => this.decodeEffect(item)))
    }

    decodeList = (input: ModelInput<TShape>[]): TModel[] => {
        return this.runSync(this.decodeListEffect(input))
    }

    private decodeShapeEffect = (
        input: ModelInput<TShape>
    ): Effect.Effect<TShape, ParsingResponseException, never> => {
        const keys = Object.keys(this.fields) as Array<keyof TShape>
        let effect: Effect.Effect<TShape, ParsingResponseException, never> = Effect.succeed({} as TShape)

        keys.forEach((key) => {
            effect = effect.pipe(
                Effect.flatMap((payload) =>
                    this.fields[key](input[key], this.path).pipe(
                        Effect.map((value) => {
                            return {
                                ...payload,
                                [key]: value,
                            } as TShape
                        })
                    )
                )
            )
        })

        return effect
    }

    private runSync<TValue>(
        effect: Effect.Effect<TValue, ParsingResponseException, never>
    ): TValue {
        const result = Effect.runSync(Effect.either(effect))

        if (result._tag === "Left") {
            throw result.left
        }

        return result.right
    }
}
