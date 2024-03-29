import { Input as NativeBaseInput, IInputProps, FormControl } from "native-base"

type Props = IInputProps & {
    errorMessage?: string | null
}

export function Input({ errorMessage = null, isInvalid, ...rest }: Props) {
    const invalid = !!errorMessage || isInvalid
    return (
        <FormControl isInvalid={invalid} marginBottom={4}> 
            <NativeBaseInput
                bg="gray.700"
                h={14}
                px={4}
                borderWidth={0}
                fontSize="md"
                color="white"
                fontFamily="body"
                isInvalid={invalid}
                placeholderTextColor="gray.300"
                _focus={{
                    backgroundColor: "gray.700",
                    borderWidth: 1,
                    borderColor: "green.500"
                }}
                _invalid={{
                    borderWidth: 1,
                    borderColor: "red.500"
                }}
                {...rest}
            />
            <FormControl.ErrorMessage _text={{color: "red.500"}}>
                {errorMessage}
            </FormControl.ErrorMessage>
        </FormControl>
    )
}