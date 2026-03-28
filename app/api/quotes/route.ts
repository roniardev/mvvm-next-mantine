import EffectMessage, { getFailedQuoteListRequestMessage } from "@/common/constants/message/effect"
import Message from "@/common/constants/message"
import Crypto from "@/utils/crypto"
import { Effect } from "effect"
import { NextResponse } from "next/server"

const DEFAULT_LIMIT = 20
const QUOTE_API_TIMEOUT_MS = 10000

type QuoteApiItem = {
    id: number
    quote: string
    author: string
}

type QuoteApiResponse = {
    quotes: QuoteApiItem[]
    total: number
    skip: number
    limit: number
}

type QuoteListApiResponse = {
    data: QuoteApiItem[]
    total: number
    page: number
    limit: number
}

const toRouteError = (error: unknown, fallbackMessage: string): Error => {
    if (error instanceof Error) {
        return error
    }

    return new Error(fallbackMessage)
}

const parseLimit = (value: string | null): number => {
    const parsedValue = Number(value)

    if (!Number.isFinite(parsedValue) || parsedValue <= 0) {
        return DEFAULT_LIMIT
    }

    return parsedValue
}

const parsePage = (value: string | null): number => {
    const parsedValue = Number(value)

    if (!Number.isFinite(parsedValue) || parsedValue < 0) {
        return 0
    }

    return parsedValue
}

const getQuoteBaseUrl = (q?: string): string => {
    if (q) {
        return "https://dummyjson.com/quotes/search"
    }

    return "https://dummyjson.com/quotes"
}

const buildUpstreamRequest = (request: Request): { url: string; page: number; limit: number } => {
    const requestUrl = new URL(request.url)
    const q = requestUrl.searchParams.get("q")?.trim()
    const page = parsePage(requestUrl.searchParams.get("page"))
    const limit = parseLimit(requestUrl.searchParams.get("limit"))
    const skip = page * limit
    const upstreamUrl = new URL(getQuoteBaseUrl(q))

    upstreamUrl.searchParams.set("limit", String(limit))
    upstreamUrl.searchParams.set("skip", String(skip))

    if (q) {
        upstreamUrl.searchParams.set("q", q)
    }

    return {
        url: upstreamUrl.toString(),
        page,
        limit,
    }
}

const createSuccessResponse = (data: QuoteListApiResponse): NextResponse => {
    return NextResponse.json({
        status: true,
        message: Message.DEFAULT_SUCCESS,
        data: Crypto.encrypt(JSON.stringify(JSON.stringify(data))),
    })
}

const createErrorResponse = (message: string, status = 500): NextResponse => {
    return NextResponse.json(
        {
            status: false,
            message,
            data: null,
        },
        {
            status,
        }
    )
}

export async function GET(request: Request) {
    const program: Effect.Effect<QuoteListApiResponse, Error, never> = Effect.succeed(
        buildUpstreamRequest(request)
    ).pipe(
        Effect.flatMap((upstreamRequest) =>
            Effect.tryPromise({
                try: () =>
                    fetch(upstreamRequest.url, {
                        method: "GET",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        signal: AbortSignal.timeout(QUOTE_API_TIMEOUT_MS),
                    }),
                catch: (error) => toRouteError(error, EffectMessage.FAILED_TO_FETCH_QUOTE_LIST),
            }).pipe(
                Effect.flatMap((response) => {
                    if (!response.ok) {
                        return Effect.fail(
                            new Error(getFailedQuoteListRequestMessage(response.status, response.statusText))
                        )
                    }

                    return Effect.tryPromise({
                        try: () => response.json() as Promise<QuoteApiResponse>,
                        catch: (error) =>
                            toRouteError(error, EffectMessage.FAILED_TO_PARSE_QUOTE_LIST_RESPONSE),
                    }).pipe(
                        Effect.map((payload) => ({
                            data: payload.quotes,
                            total: payload.total,
                            page: upstreamRequest.page + 1,
                            limit: upstreamRequest.limit,
                        }))
                    )
                })
            )
        )
    )

    return Effect.runPromise(
        program.pipe(
            Effect.match({
                onFailure: (error: Error) => createErrorResponse(error.message),
                onSuccess: (payload) => createSuccessResponse(payload),
            })
        )
    )
}

export async function POST() {
    return createErrorResponse(EffectMessage.ADD_QUOTE_NOT_IMPLEMENTED, 501)
}
