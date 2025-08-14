'use client'

import { Flex, Alert } from '@mantine/core'
import { observer } from 'mobx-react-lite'
import { ColorSchemeToggle } from '../components/color-scheme-toggle'
import { quoteVM } from '../injector/injector'
import { QuotesTable } from '@/components/quote/quotes-table'
import { notifications } from '@mantine/notifications'
import { useEffect } from 'react'
import { Icon } from "@iconify/react";


const Page = observer(() => {
	const { data: quotesData, isLoading, error } = quoteVM.useQuoteListQuery()

	useEffect(() => {
		if (error) {
			notifications.show({
				icon: <Icon icon="line-md:alert-twotone" />,
				message: error.getException().message,
				color: 'red',
				autoClose: 5000,
				radius: 'lg',
				withBorder: true,
				position: 'top-right',
			})
		}
	}, [error])

	return (
		<Flex direction="column" gap="lg" justify="center" align="center">
			<ColorSchemeToggle />
			<Flex w="50rem">
				<QuotesTable quotes={quotesData?.getData() ?? []} isLoading={isLoading} />
			</Flex>
		</Flex>
	)
})

export default Page
