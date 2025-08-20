'use client';
import { Box, Flex, Skeleton, Text } from '@mantine/core'
import { DataTable } from 'mantine-datatable'
import QuoteModel from '@/src/quote/data/model/quote-model'

interface QuotesTableProps {
    quotes: QuoteModel[]
    isLoading: boolean
}

export function QuotesTable({ quotes, isLoading = true }: QuotesTableProps) {
    const records = quotes.map((quote, index) => ({
        id: index + 1,
        author: quote.getAuthor(),
        quote: quote.getQuote(),
    }))

    if (isLoading) {
        return (
            <Flex direction="column" gap="md">
                <Text size="xl" fw={700} ta="center">
                    Quotes
                </Text>
                <Skeleton height={500} width={800} />
            </Flex>
        )
    }

    return (
        <Flex direction="column" gap="md">
            <Text size="xl" fw={700} ta="center">
                Quotes
            </Text>
            <DataTable
                h={500}
                w={800}
                height={500}
                emptyState={<Text size="xl" fw={700} ta="center">No quotes found</Text>}
                withTableBorder
                borderRadius="md"
                withColumnBorders
                striped
                highlightOnHover
                records={records}
                fetching={isLoading}
                columns={[
                    {
                        accessor: 'id',
                        title: 'ID',
                        textAlign: 'right',
                    },
                    { accessor: 'author' },
                    {
                        accessor: 'quote',
                        title: 'Quote',
                    },
                ]}
            />

        </Flex>
    )
}