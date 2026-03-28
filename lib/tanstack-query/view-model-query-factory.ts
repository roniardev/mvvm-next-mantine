import {
    useMutation,
    useQuery,
    type QueryKey,
    type UseMutationOptions,
    type UseMutationResult,
    type UseQueryOptions,
    type UseQueryResult,
} from "@tanstack/react-query"

import type { LoggerInterface } from "@/utils/logger"
import Either, { type EitherProps } from "@/utils/either"
import type { QueryClientManager } from "./query-client-manager"

type QueryMeta = Record<string, unknown>

type QueryMetaFactory = QueryMeta | (() => QueryMeta)

type MutationMetaFactory<TData, TError, TVariables> =
  | QueryMeta
  | ((payload: { data?: TData; error?: TError; variables: TVariables }) => QueryMeta)

type InvalidateKeys<TData, TVariables> =
  | QueryKey[]
  | ((payload: { data: TData; variables: TVariables }) => QueryKey[])

type ErrorModelLike = {
    getException: () => Error
    getPath: () => string
}

type EitherQueryConfig<TData, TError> = {
    key: QueryKey
    path: string
    request: () => Promise<EitherProps<TError, TData>>
    meta?: QueryMetaFactory
    options?: Omit<UseQueryOptions<TData, TError>, "queryKey" | "queryFn">
}

type EitherMutationConfig<TData, TError, TVariables, TContext> = {
    path: string
    request: (variables: TVariables) => Promise<EitherProps<TError, TData>>
    meta?: MutationMetaFactory<TData, TError, TVariables>
    invalidateKeys?: InvalidateKeys<TData, TVariables>
    options?: Omit<UseMutationOptions<TData, TError, TVariables, TContext>, "mutationFn">
}

export class ViewModelQueryFactory {
    constructor(
        private readonly queryClientManager: QueryClientManager,
        private readonly logger?: LoggerInterface
    ) {}

    useEitherQuery<TData, TError>(
        config: EitherQueryConfig<TData, TError>
    ): UseQueryResult<TData, TError> {
        return useQuery<TData, TError>({
            ...config.options,
            queryKey: config.key,
            queryFn: async () => {
                const meta = this.resolveQueryMeta(config.meta)
                this.logger?.info(`${config.path}: Fetching data`, {
                    path: config.path,
                    ...meta,
                })

                try {
                    const result = await config.request()

                    if (Either.IsLeft(result)) {
                        throw Either.UnwrapEither(result)
                    }

                    return Either.UnwrapEither(result)
                } catch (error) {
                    this.logger?.error(`${config.path}: Query failed`, {
                        path: config.path,
                        ...meta,
                        error: this.serializeError(error),
                    })

                    throw error as TError
                }
            },
        })
    }

    useEitherMutation<TData, TError, TVariables, TContext = unknown>(
        config: EitherMutationConfig<TData, TError, TVariables, TContext>
    ): UseMutationResult<TData, TError, TVariables, TContext> {
        const options = config.options

        return useMutation<TData, TError, TVariables, TContext>({
            ...options,
            mutationFn: async (variables) => {
                const meta = this.resolveMutationMeta(config.meta, { variables })
                this.logger?.info(`${config.path}: Executing mutation`, {
                    path: config.path,
                    ...meta,
                })

                try {
                    const result = await config.request(variables)

                    if (Either.IsLeft(result)) {
                        throw Either.UnwrapEither(result)
                    }

                    const data = Either.UnwrapEither(result)

                    this.logger?.info(`${config.path}: Mutation successful`, {
                        path: config.path,
                        ...this.resolveMutationMeta(config.meta, { data, variables }),
                    })

                    return data
                } catch (error) {
                    this.logger?.error(`${config.path}: Mutation failed`, {
                        path: config.path,
                        ...meta,
                        error: this.serializeError(error),
                    })

                    throw error as TError
                }
            },
            onSuccess: async (data, variables, context) => {
                await this.invalidateKeys(config.invalidateKeys, data, variables)
                await options?.onSuccess?.(data, variables, context)
            },
            onError: async (error, variables, context) => {
                await options?.onError?.(error, variables, context)
            },
        })
    }

    private resolveQueryMeta(meta?: QueryMetaFactory): QueryMeta {
        if (!meta) {
            return {}
        }

        return typeof meta === "function" ? meta() : meta
    }

    private resolveMutationMeta<TData, TError, TVariables>(
        meta: MutationMetaFactory<TData, TError, TVariables> | undefined,
        payload: { data?: TData; error?: TError; variables: TVariables }
    ): QueryMeta {
        if (!meta) {
            return {}
        }

        return typeof meta === "function" ? meta(payload) : meta
    }

    private async invalidateKeys<TData, TVariables>(
        keys: InvalidateKeys<TData, TVariables> | undefined,
        data: TData,
        variables: TVariables
    ): Promise<void> {
        if (!keys) {
            return
        }

        const resolvedKeys =
      typeof keys === "function" ? keys({ data, variables }) : keys

        await Promise.all(
            resolvedKeys.map((key) => this.queryClientManager.invalidateQueries(key))
        )
    }

    private serializeError(error: unknown): QueryMeta | string {
        if (this.isErrorModelLike(error)) {
            const exception = error.getException()
            return {
                path: error.getPath(),
                exceptionName: exception.name,
                exceptionMessage: exception.message,
            }
        }

        if (error instanceof Error) {
            return {
                name: error.name,
                message: error.message,
                stack: error.stack ?? "",
            }
        }

        return String(error)
    }

    private isErrorModelLike(error: unknown): error is ErrorModelLike {
        if (typeof error !== "object" || error === null) {
            return false
        }

        return (
            "getException" in error &&
      typeof error.getException === "function" &&
      "getPath" in error &&
      typeof error.getPath === "function"
        )
    }
}
