import { Alert } from 'react-native';
import { useState } from 'react';
import { Center, Heading, Image, ScrollView, Text, VStack, useToast } from 'native-base';
import { useNavigation } from '@react-navigation/native';
import { useForm, Controller } from 'react-hook-form'
import * as yup from 'yup'
import { yupResolver } from '@hookform/resolvers/yup'

import { api } from '@services/api'
import { AppError } from '@utils/AppError';

import BackgroundImg from '@assets/background.png'
import LogoSvg from '@assets/logo.svg'
import { Input } from '@components/Input'
import { Button } from '@components/Button'
import { useAuth } from '@hooks/useAuth';

type FormDataPros = {
    name: string
    email: string
    password: string
    password_confirm: string
}

const signUpSchema = yup.object({
    name: yup.string().required('Informe o nome.'),
    email: yup.string().required('Informe o e-mail.').email('E-mail inválido.'),
    password: yup.string().required('Informe uma senha.').min(6, 'A senha deve conter pelo menos 6 digitos.'),
    password_confirm: yup.string().required('Informe a confirmação de senha.').oneOf([yup.ref('password'), ''], 'A confirmação da senha não confere.')
})

export function SignUp() {
    const [isLoading, setIsLoading] = useState(false)
    const navigation = useNavigation()
    const { signIn } = useAuth()

    const toast = useToast()

    const { control, handleSubmit, formState: { errors } } = useForm<FormDataPros>({
        defaultValues: {
            name: ''
        },
        resolver: yupResolver(signUpSchema)
    })

    function handleGoBack() {
        navigation.goBack()
    }

    async function handleSignUp({ name, email, password }: FormDataPros) {
        try {
            setIsLoading(true)
            await api.post('/users', {
                name, email, password
            })
            signIn(email, password)
        } catch (error) {
            const isAppError = error instanceof AppError
            const title = isAppError ? error.message : 'Não foi possível criar a conta'
            toast.show({
                title,
                placement: 'top',
                bgColor: 'red.500'
            })      
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <ScrollView contentContainerStyle={{ flex: 1 }} showsVerticalScrollIndicator={false}>
            <VStack flex={1} px={10} pb={16}>
                <Image
                    source={BackgroundImg}
                    defaultSource={BackgroundImg}
                    alt='Pessoas treinando'
                    resizeMode='contain'
                    position='absolute'
                />
                <Center my={24}>
                    <LogoSvg />
                    <Text color="gray.100" fontSize="sm">Treine sua mente e o seu corpo</Text>
                </Center>
                <Center>
                    <Heading color="gray.100" fontSize="xl" mb={6} fontFamily="heading">
                        Crie sua conta
                    </Heading>

                    <Controller
                        control={control}
                        name="name"
                        render={({ field }) => (
                            <Input
                                placeholder='Nome'
                                onChangeText={field.onChange}
                                value={field.value}
                                errorMessage={errors.name?.message}
                            />
                        )}
                    />

                    <Controller
                        control={control}
                        name='email'
                        render={({ field }) => (
                            <Input
                                placeholder='E-mail'
                                keyboardType='email-address'
                                autoCapitalize='none'
                                onChangeText={field.onChange}
                                value={field.value}
                                errorMessage={errors.email?.message}
                            />
                        )}
                    />

                    <Controller
                        control={control}
                        name='password'
                        render={({ field }) => (
                            <Input
                                placeholder='Senha'
                                secureTextEntry
                                onChangeText={field.onChange}
                                value={field.value}
                                errorMessage={errors.password?.message}
                            />
                        )}

                    />

                    <Controller
                        control={control}
                        name='password_confirm'
                        render={({ field }) => (
                            <Input
                                placeholder='Confirme a senha'
                                secureTextEntry
                                onChangeText={field.onChange}
                                value={field.value}
                                onSubmitEditing={handleSubmit(handleSignUp)}
                                returnKeyType="send"
                                errorMessage={errors.password_confirm?.message}
                            />
                        )}
                    />

                    <Button title='Criar e acesssar' onPress={handleSubmit(handleSignUp)} />

                </Center>

                <Button title='Voltar para o login' variant='outline' mt={16} onPress={handleGoBack} isLoading={isLoading} />
            </VStack>
        </ScrollView>
    )
}