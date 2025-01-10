import '@mantine/core/styles.css';
import { ColorSchemeScript, MantineProvider } from '@mantine/core';
import type React from 'react';
import { theme } from '../theme';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';

export const metadata = {
	title: 'Mantine Next.js template',
	description: 'I am using Mantine with Next.js!',
};

const queryClient = new QueryClient();

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="en">
			<head>
				<ColorSchemeScript />
				<link rel="shortcut icon" href="/favicon.svg" />
				<meta
					name="viewport"
					content="minimum-scale=1, initial-scale=1, width=device-width, user-scalable=no"
				/>
			</head>
			<body>
				<QueryClientProvider client={queryClient}>
					<MantineProvider theme={theme}>{children}</MantineProvider>
				</QueryClientProvider>
			</body>
		</html>
	);
}
