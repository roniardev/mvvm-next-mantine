'use client';

import { Button, Flex, Text } from '@mantine/core';
import { observer } from 'mobx-react-lite';
import { ColorSchemeToggle } from '../components/color-scheme-toggle';
import { homeVM } from '../injector/injector';

const Page = observer(() => {
	const count = homeVM.getCount();
	return (
		<Flex direction="column" gap="lg">
			<ColorSchemeToggle />
			<Flex
				direction="column"
				justify="center"
				align="center"
				mt="xl"
				gap="md"
			>
				<Text size="lg" fw={600}>
					Count: {count}
				</Text>
				<Flex direction="row" gap="md">
					<Button onClick={() => homeVM.incrementCount()}>
						Increment
					</Button>
					<Button onClick={() => homeVM.decrementCount()}>
						Decrement
					</Button>
				</Flex>
			</Flex>
		</Flex>
	);
});

export default Page;
