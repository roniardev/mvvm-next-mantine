import { getUnexpectedEffectErrorMessage } from "@/common/constants/message/effect"
import type { ErrorModelJSONProps } from "@/common/models/error-model"
import ErrorModel from "@/common/models/error-model"
import Crypto from "@/utils/crypto"
import Either, { type EitherProps } from "@/utils/either"
import GeneralException from "@/utils/exceptions/general-exception"
import { Effect } from "effect"

type EffectConfig<TErrorData> = {
    path: string
    message: string
    errorData: TErrorData
}

type TryPromiseEffectConfig<TData, TErrorData> = EffectConfig<TErrorData> & {
    try: () => Promise<TData>
}

type TrySyncEffectConfig<TData, TErrorData> = EffectConfig<TErrorData> & {
    try: () => TData
}

type DecodeEncryptedRemoteConfig<TData, TErrorData> = {
    path: string
    response: string
    errorData: TErrorData
    parseSuccess: (value: unknown) => TData
    decryptMessage: string
    parseMessage: string
    successMessage: string
}

type RunEncryptedRemoteConfig<TData, TErrorData> = {
    path: string
    effect: Effect.Effect<TData, ErrorModel<TErrorData> | Error, never>
    serializeSuccess: (data: TData) => string
    errorData: TErrorData
    fallbackMessage?: string
}

export class EffectHelper {
    public tryPromise<TData, TErrorData>(
        config: TryPromiseEffectConfig<TData, TErrorData>
    ): Effect.Effect<TData, ErrorModel<TErrorData>, never> {
        return Effect.tryPromise({
            try: config.try,
            catch: (error) =>
                this.toErrorModel(
                    config.path,
                    error,
                    config.errorData,
                    config.message
                ),
        })
    }

    public trySync<TData, TErrorData>(
        config: TrySyncEffectConfig<TData, TErrorData>
    ): Effect.Effect<TData, ErrorModel<TErrorData>, never> {
        return Effect.try({
            try: config.try,
            catch: (error) =>
                this.toErrorModel(
                    config.path,
                    error,
                    config.errorData,
                    config.message
                ),
        })
    }

    public fromEither<TError, TData>(
        value: EitherProps<TError, TData>
    ): Effect.Effect<TData, TError, never> {
        if (Either.IsLeft(value)) {
            return Effect.fail(Either.UnwrapEither(value))
        }

        return Effect.succeed(Either.UnwrapEither(value))
    }

    public runAsEither<TError, TData>(
        effect: Effect.Effect<TData, TError, never>
    ): Promise<EitherProps<TError, TData>> {
        return Effect.runPromise(
            effect.pipe(
                Effect.match({
                    onFailure: (error) => Either.Left(error),
                    onSuccess: (data) => Either.Right(data),
                })
            )
        )
    }

    public decodeEncryptedRemote<TData, TErrorData>(
        config: DecodeEncryptedRemoteConfig<TData, TErrorData>
    ): Effect.Effect<TData, ErrorModel<TErrorData>, never> {
        return this.trySync<string, TErrorData>({
            path: config.path,
            message: config.decryptMessage,
            errorData: config.errorData,
            try: () => Crypto.decrypt(config.response),
        }).pipe(
            Effect.flatMap((decryptedResponse) =>
                this.trySync<unknown, TErrorData>({
                    path: config.path,
                    message: config.parseMessage,
                    errorData: config.errorData,
                    try: () => JSON.parse(decryptedResponse),
                })
            ),
            Effect.flatMap((parsedResponse) => {
                if (typeof parsedResponse === "object" && parsedResponse !== null && ErrorModel.isValidJSON(parsedResponse)) {
                    const remoteError = ErrorModel.parse(parsedResponse as ErrorModelJSONProps<unknown>)

                    return Effect.fail(
                        new ErrorModel({
                            path: `${config.path} > ${remoteError.getPath()}`,
                            exception: remoteError.getException(),
                            data: config.errorData,
                        })
                    )
                }

                return this.trySync<TData, TErrorData>({
                    path: config.path,
                    message: config.successMessage,
                    errorData: config.errorData,
                    try: () => config.parseSuccess(parsedResponse),
                })
            })
        )
    }

    public runEncryptedRemote<TData, TErrorData>(
        config: RunEncryptedRemoteConfig<TData, TErrorData>
    ): Promise<string> {
        let fallbackMessage = config.fallbackMessage

        if (!fallbackMessage) {
            fallbackMessage = getUnexpectedEffectErrorMessage(config.path)
        }

        return Effect.runPromise(
            config.effect.pipe(
                Effect.map((data) => Crypto.encrypt(config.serializeSuccess(data))),
                Effect.catchAll((error) =>
                    Effect.succeed(
                        Crypto.encrypt(
                            this.toErrorModel(
                                config.path,
                                error,
                                config.errorData,
                                fallbackMessage
                            ).stringifyJSON()
                        )
                    )
                )
            )
        )
    }

    private toError(
        error: unknown,
        fallbackMessage: string
    ): Error {
        if (error instanceof Error) {
            return error
        }

        if (typeof error === "string" && error) {
            return new GeneralException(error)
        }

        return new GeneralException(fallbackMessage)
    }

    private toErrorModel<TErrorData>(
        path: string,
        error: unknown,
        errorData: TErrorData,
        fallbackMessage: string
    ): ErrorModel<TErrorData> {
        if (error instanceof ErrorModel) {
            return error
        }

        return new ErrorModel({
            path,
            exception: this.toError(error, fallbackMessage),
            data: errorData,
        })
    }
}

export const effectHelper = new EffectHelper()
