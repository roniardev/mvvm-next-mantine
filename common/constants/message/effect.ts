const EffectMessage = {
    INVALID_QUOTE_MODEL_ID: "Invalid quote model id",
    INVALID_QUOTE_MODEL_QUOTE: "Invalid quote model quote",
    INVALID_QUOTE_MODEL_AUTHOR: "Invalid quote model author",
    INVALID_QUOTE_LIST_REQUEST_PAYLOAD: "Invalid quote list request payload",
    FAILED_TO_FETCH_QUOTE_LIST: "Failed to fetch quote list",
    FAILED_TO_DECODE_QUOTE_LIST_RESPONSE: "Failed to decode quote list response",
    FAILED_TO_REQUEST_QUOTE_LIST_REMOTE_SOURCE: "Failed to request quote list remote source",
    FAILED_TO_DECRYPT_QUOTE_LIST_RESPONSE: "Failed to decrypt quote list response",
    FAILED_TO_PARSE_QUOTE_LIST_RESPONSE: "Failed to parse quote list response",
    FAILED_TO_BUILD_QUOTE_LIST_MODEL: "Failed to build quote list model",
    INTERNAL_ERROR_WHILE_FETCHING_QUOTE_LIST: "Internal error occurred while fetching quote list",
    FAILED_TO_ADD_QUOTE: "Failed to add quote",
    FAILED_TO_DECODE_ADD_QUOTE_RESPONSE: "Failed to decode add quote response",
    FAILED_TO_REQUEST_ADD_QUOTE_REMOTE_SOURCE: "Failed to request add quote remote source",
    FAILED_TO_DECRYPT_ADD_QUOTE_RESPONSE: "Failed to decrypt add quote response",
    FAILED_TO_PARSE_ADD_QUOTE_RESPONSE: "Failed to parse add quote response",
    FAILED_TO_BUILD_ADD_QUOTE_RESULT: "Failed to build add quote result",
    INTERNAL_ERROR_WHILE_ADDING_QUOTE: "Internal error occurred while adding quote",
    ADD_QUOTE_NOT_IMPLEMENTED: "Add quote is not implemented yet",
} as const

export const getUnexpectedEffectErrorMessage = (path: string): string => {
    return `${path}: unexpected error`
}

export const getFailedQuoteListRequestMessage = (status: number, statusText: string): string => {
    return `${EffectMessage.FAILED_TO_FETCH_QUOTE_LIST}: ${status} ${statusText}`
}

export const getModelParsingMessage = (path: string, message: string): string => {
    return `${path}: ${message}`
}

export default EffectMessage
