"use client"

import "@mantine/core/styles.css"
import "mantine-datatable/styles.css"
import '@mantine/notifications/styles.css'
import "./layout.css"

import { Archivo } from 'next/font/google'
import { MantineProvider } from "@mantine/core"
import { Notifications } from '@mantine/notifications'
import type React from "react"
import { theme } from "../theme"
import { QueryClientProvider, QueryClient } from "@tanstack/react-query"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"
import { QueryClientManager } from "@/lib/tanstack-query/query-client-manager"

const font = Archivo({
    subsets: ['latin'],
    weight: ['400', '500', '600', '700'],
})

const queryClientManager = new QueryClientManager()

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
            <head>
                <link rel="shortcut icon" href="/favicon.svg" />
                <meta
                    name="viewport"
                    content="minimum-scale=1, initial-scale=1, width=device-width, user-scalable=no"
                />
            </head>
            <body className={font.className}>
                <QueryClientProvider client={queryClientManager.getClient()}>
                    <MantineProvider theme={theme}>
                        <Notifications />
                        {children}
                    </MantineProvider>
                    <ReactQueryDevtools initialIsOpen={false} />
                </QueryClientProvider>
            </body>
        </html>
    )
}
