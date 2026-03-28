export interface LoggerInterface {
    info(message: string, meta?: Record<string, unknown>): void
    error(message: string, meta?: Record<string, unknown>): void
    warn(message: string, meta?: Record<string, unknown>): void
    debug(message: string, meta?: Record<string, unknown>): void
}

class ServerLogger implements LoggerInterface {
    private winston: any = null
    private isInitialized = false

    constructor() {
        this.initializeWinston()
    }

    private async initializeWinston() {
        if (typeof window === "undefined" && !this.isInitialized) {
            try {
                // Hanya di server-side
                const winston = await import("winston")
                const path = await import("path")
                const DailyRotateFile = await import("winston-daily-rotate-file")

                const dailyRotateFormat = winston.default.format.combine(
                    winston.default.format.timestamp(),
                    winston.default.format.errors({ stack: true }),
                    winston.default.format.printf(({ timestamp, level, message, ...meta }) => {
                        const metaStr = Object.keys(meta).length > 0 ? ` ${JSON.stringify(meta, null, 2)}` : ''
                        return `[${timestamp}] [${level.toUpperCase()}] ${message}${metaStr}`
                    })
                )

                this.winston = winston.default.createLogger({
                    level: "debug", // Always show all logs
                    format: dailyRotateFormat,
                    defaultMeta: { service: "mvvm-next-mantine" },
                    silent: false, // Ensure logs are not silent
                    exitOnError: false, // Don't exit on error
                    transports: [
                        // Daily rotate file for all logs (including INFO)
                        new DailyRotateFile.default({
                            filename: path.join(process.cwd(), "logs", "%DATE%.log"),
                            datePattern: "MM-DD-YYYY",
                            level: "debug", // Capture all levels including INFO
                            format: dailyRotateFormat,
                            maxSize: "10m", // 10MB
                            maxFiles: "30d", // Keep 30 days
                            zippedArchive: true
                        }),
                        // Daily rotate file for errors only
                        new DailyRotateFile.default({
                            filename: path.join(process.cwd(), "logs", "error-%DATE%.log"),
                            datePattern: "MM-DD-YYYY",
                            level: "error",
                            format: dailyRotateFormat,
                            maxSize: "5m", // 5MB
                            maxFiles: "7d", // Keep 7 days
                            zippedArchive: true
                        }),
                        // Always add console transport with colors
                        new winston.default.transports.Console({
                            format: winston.default.format.combine(
                                winston.default.format.timestamp({
                                    format: "MM-DD-YYYY HH:mm:ss"
                                }),
                                winston.default.format.colorize({
                                    all: true,
                                    colors: {
                                        error: 'red',
                                        warn: 'yellow',
                                        info: 'green',
                                        debug: 'blue'
                                    }
                                }),
                                winston.default.format.printf(({ timestamp, level, message, ...meta }) => {
                                    const metaStr = Object.keys(meta).length > 0 ? ` ${JSON.stringify(meta, null, 2)}` : ''
                                    return `${timestamp} ${level}: ${message}${metaStr}`
                                })
                            )
                        })
                    ]
                })

                // Add event listeners for debugging
                this.winston.on('error', (error: unknown) => {
                    console.error('Winston logger error:', error)
                })

                this.winston.on('warn', (warning: unknown) => {
                    console.warn('Winston logger warning:', warning)
                })


                this.isInitialized = true
            } catch (error) {
                console.error("Failed to initialize Winston logger:", error)
            }
        }
    }

    private async log(level: string, message: string, meta?: Record<string, unknown>): Promise<void> {
        // Ensure winston is initialized before logging
        if (!this.isInitialized) {
            await this.initializeWinston()
        }

        if (this.winston && this.isInitialized) {
            this.winston[level](message, meta)
        } else {
            const timestamp = new Date().toLocaleString("en-US", {
                month: "2-digit",
                day: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit"
            })

            // Color codes for console output
            const colors = {
                error: '\x1b[31m', // Red
                warn: '\x1b[33m',  // Yellow
                info: '\x1b[32m',  // Green
                debug: '\x1b[34m'  // Blue
            }
            const reset = '\x1b[0m' // Reset color

            const color = colors[level as keyof typeof colors] || ''
            const metaStr = meta && Object.keys(meta).length > 0 ? ` ${JSON.stringify(meta, null, 2)}` : ''
            const logMessage = `${color}[${timestamp}] [${level.toUpperCase()}] ${message}${metaStr}${reset}`

            console[level === "error" ? "error" : level === "warn" ? "warn" : "log"](logMessage)
        }
    }

    public info = (message: string, meta?: Record<string, unknown>): void => {
        this.log("info", message, meta).catch(console.error)
    }

    public error = (message: string, meta?: Record<string, unknown>): void => {
        this.log("error", message, meta).catch(console.error)
    }

    public warn = (message: string, meta?: Record<string, unknown>): void => {
        this.log("warn", message, meta).catch(console.error)
    }

    public debug = (message: string, meta?: Record<string, unknown>): void => {
        this.log("debug", message, meta).catch(console.error)
    }
}

class ClientLogger implements LoggerInterface {
    private isProduction(): boolean {
        return process.env.NODE_ENV === "production"
    }

    private formatMessage(level: string, message: string, meta?: Record<string, unknown>): string {
        const timestamp = new Date().toLocaleString("en-US", {
            month: "2-digit",
            day: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit"
        })

        // Color codes for console output
        const colors = {
            error: '\x1b[31m', // Red
            warn: '\x1b[33m',  // Yellow
            info: '\x1b[32m',  // Green
            debug: '\x1b[34m'  // Blue
        }
        const reset = '\x1b[0m' // Reset color

        const color = colors[level as keyof typeof colors] || ''
        const metaStr = meta && Object.keys(meta).length > 0 ? ` ${JSON.stringify(meta, null, 2)}` : ''

        return `${color}[${timestamp}] [${level.toUpperCase()}] ${message}${metaStr}${reset}`
    }

    public info = (message: string, meta?: Record<string, unknown>): void => {
        if (this.isProduction()) {
            return
        }
        console.log(this.formatMessage("info", message, meta))
    }

    public error = (message: string, meta?: Record<string, unknown>): void => {
        if (this.isProduction()) {
            return
        }
        console.error(this.formatMessage("error", message, meta))
    }

    public warn = (message: string, meta?: Record<string, unknown>): void => {
        if (this.isProduction()) {
            return
        }
        console.warn(this.formatMessage("warn", message, meta))
    }

    public debug = (message: string, meta?: Record<string, unknown>): void => {
        if (this.isProduction()) {
            return
        }
        console.debug(this.formatMessage("debug", message, meta))
    }
}

// Export logger berdasarkan environment
export default typeof window === "undefined" ? ServerLogger : ClientLogger
