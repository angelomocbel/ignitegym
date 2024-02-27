import { HistoryDTO } from "@dtos/HistoryDTO";
import { HStack, Heading, VStack, Text } from "native-base";

type Props = {
    data: HistoryDTO
}

export function HistoryCard({ data }: Props) {
    return (
        <HStack
            width="full"
            paddingX={5}
            paddingY={4}
            marginBottom={3}
            background="gray.600"
            rounded="md"
            alignItems="center"
            justifyContent="space-between"
        >
            <VStack marginRight={5} flex={1}>
                <Heading color="white" fontSize='md' textTransform='capitalize' numberOfLines={1} fontFamily="heading">
                    {data.group}
                </Heading>
                <Text color="gray.100" fontSize='lg' numberOfLines={1}>
                    {data.name}
                </Text>
            </VStack>
            <Text color='gray.300' fontSize='md'>
                {data.hour}
            </Text>
        </HStack>
    )
}