import { Center, Heading } from "native-base";

type Props = {
    title: string
}

export function ScreenHeader({ title }: Props){
    return(
        <Center bg="gray.600" paddingBottom={6} paddingTop={16}>
            <Heading color="gray.100" fontSize="xl" fontFamily="heading">
                {title}
            </Heading>
        </Center>
    )
}