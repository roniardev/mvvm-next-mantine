import { createVanillaExtractPlugin } from "@vanilla-extract/next-plugin"
import type { NextConfig } from "next"
import path from "path"

const withVanillaExtract = createVanillaExtractPlugin()

const nextConfig: NextConfig = {
    reactStrictMode: false,
    turbopack: {
        resolveExtensions: [".ts", ".tsx", ".js", ".jsx", ".json", ".mjs", ".cjs"],
        resolveAlias: {
            "@": path.resolve(__dirname, "src"),
        },
    }
}

export default withVanillaExtract(nextConfig)
