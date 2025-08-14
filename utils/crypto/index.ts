import * as crypto from "crypto"
import Message from "@/common/constants/message"
import Environment from "../environment"
import GeneralException from "../exceptions/general-exception"
const env = new Environment()

// biome-ignore lint/complexity/noStaticOnlyClass: <explanation>
export default class Crypto {
    public static encrypt = (text: string): string => {
        if (!text) throw new GeneralException(Message.DEFAULT_ERROR_ENCRYPT)

        // GENERATE RANDOM BYTES FOR INITIAL VECTOR
        const iv = crypto.randomBytes(16)
        // GENERATE RANDOM BYTES FOR SALT
        const salt = crypto.randomBytes(64)
        // GENERATE ENCRYPTION KEY
        const key = crypto.pbkdf2Sync(
            env.getEncryptKey(),
            salt,
            2145,
            32,
            "sha512"
        )
        // AES 256 GCM
        const cipher = crypto.createCipheriv("aes-256-gcm", key, iv)
        // ENCRYPT "text"
        const encrypted = Buffer.concat([
            cipher.update(text, "utf8"),
            cipher.final()
        ])
        // Get authentication tag
        const authTag = cipher.getAuthTag()

        // RETURN THE RESULT - include auth tag in the output
        return Buffer.concat([
            salt,
            iv,
            authTag, // Store the auth tag (16 bytes)
            encrypted
        ]).toString("base64")
    }

    static decrypt = (encryptedText: string): string => {
        if (!encryptedText) throw new GeneralException(Message.DEFAULT_ERROR_ENCRYPT)

        // DECODE BASE64
        const base64 = Buffer.from(encryptedText, "base64")
        // EXTRACT SALT, INITIAL VALUE, AUTH TAG, AND TEXT FROM BASE64 VALUE
        const salt = base64.subarray(0, 64)
        const iv = base64.subarray(64, 80)
        const authTag = base64.subarray(80, 96) // Extract the auth tag (16 bytes)
        const text = base64.subarray(96)
        // GENERATE ENCRYPTION KEY
        const key = crypto.pbkdf2Sync(
            env.getEncryptKey(),
            salt,
            2145,
            32,
            "sha512"
        )
        // AES 256 GCM Mode
        const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv)
        // Set auth tag before decryption
        decipher.setAuthTag(authTag)

        // DECRYPT THE GIVEN TEXT
        const decrypted = Buffer.concat([
            decipher.update(text),
            decipher.final()
        ])
        // RETURN THE RESULT
        return decrypted.toString("utf8")
    }
}
