export default class Environment {
    public getEncryptKey = () => {
        return process.env.NEXT_PUBLIC_ENCRYPT_KEY || ""
    }
}
