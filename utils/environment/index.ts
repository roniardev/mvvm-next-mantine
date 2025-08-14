export default class Environment {
    public getEncryptKey = () => {
        return process.env.NEXT_PUBLIC_ENCRYPT_KEY || ""
    }

    public getBaseUrl = () => {
        return process.env.NEXT_PUBLIC_BASE_URL || ""
    }

    public getAPIUrl = () => {
        return process.env.NEXT_PUBLIC_API_URL || ""
    }
}
