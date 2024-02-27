import { useState } from "react";
import { TouchableOpacity } from "react-native";
import { Center, ScrollView, VStack, Skeleton, Text, Heading, useToast } from "native-base";
import * as ImagePicker from 'expo-image-picker'
import * as FileSystem from 'expo-file-system'
import * as yup from 'yup'
import { yupResolver } from '@hookform/resolvers/yup'

import { Controller, useForm } from 'react-hook-form'

import { ScreenHeader } from '@components/ScreenHeader';
import { UserPhoto } from '@components/UserPhoto';
import { Input } from '@components/Input';
import { Button } from '@components/Button';
import { useAuth } from "@hooks/useAuth";
import { api } from "@services/api";
import { AppError } from "@utils/AppError";

import defaultUserPhotoImg from '@assets/userPhotoDefault.png'

const PHOTO_SIZE = 33

type FormData = {
    name: string
    email: string
    old_password: string
    password: string
    confirm_password: string
}

const profileSchema = yup.object({
    name: yup.string().required('Informe o nome'),
    password: yup.string().min(6, 'A senha deve conter pelo menos 6 caracteres').nullable().transform((value) => !!value ? value : null),
    confirm_password: yup
        .string()
        .nullable()
        .transform((value) => !!value ? value : null)
        .oneOf([yup.ref('password'), undefined], 'A confirmação de senha não confere')
        .when('password', {
            is: (Field: any) => Field,
            then: (schema) => schema
                .nullable()
                .required('Informe a confirmação da senha')
                .oneOf([yup.ref('password'), ''], 'A confirmação de senha não confere')
                .transform((value) => !!value ? value : null)
        }),
})

export function Profile() {
    const [isSendingData, setIsSendingData] = useState(false)
    const [photoIsLoading, setPhotoIsLoading] = useState(false)

    const toast = useToast()
    const { user, updateUserProfile } = useAuth()

    const { control, handleSubmit, formState: { errors }, reset } = useForm<FormData>({
        defaultValues: {
            name: user.name,
            email: user.email
        },
        resolver: yupResolver(profileSchema)
    })


    async function handleUserPhotoSelect() {
        setPhotoIsLoading(true)
        try {
            const photoSelected = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                quality: 1,
                aspect: [1, 1],
                allowsEditing: true,
            })

            if (photoSelected.canceled) {
                return
            }
            if (photoSelected.assets[0].uri) {
                const photoInfo = await FileSystem.getInfoAsync(photoSelected.assets[0].uri)
                if (photoInfo.exists && (photoInfo.size / 1024 / 1024 > 5)) {
                    return toast.show({
                        title: "A imagem selecionada é muito grande, selecione uma imagem com até 5 MB",
                        placement: "top",
                        bgColor: 'red.500'
                    })
                }

                const fileExtension = photoInfo.uri.split('.').pop()
                
                const photoFile = {
                    name: `${user.name}.${fileExtension}`.replace(/\s+/g, '').toLowerCase(),
                    uri: photoInfo.uri,
                    type: `${photoSelected.assets[0].type}/${fileExtension}`
                } as any
                
                const userPhotoUploadForm = new FormData()
                userPhotoUploadForm.append('avatar', photoFile)

                const avatarUpdatedResponse = await api.patch('/users/avatar', userPhotoUploadForm, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                })

                toast.show({
                    title: 'Foto de perfil atualizada',
                    placement: 'top',
                    bgColor: 'green.500'
                })
                const userUpdated = user
                userUpdated.avatar = avatarUpdatedResponse.data.avatar

                updateUserProfile(userUpdated)
            }
        } catch (error) {
            console.log(error)
        } finally {
            setPhotoIsLoading(false)
        }
    }

    async function handleProfileUpdate(data: FormData) {
        try {
            setIsSendingData(true)
            await api.put('/users', data)
            toast.show({
                title: 'Perfil atualizado com sucesso',
                placement: 'top',
                bgColor: 'green.500',
            })
            const userUpdated = user
            userUpdated.name = data.name
            updateUserProfile(userUpdated)

            if(data.password) {
                reset({
                    old_password: undefined,
                    password: undefined,
                    confirm_password: undefined

                })
            }
        } catch (error) {
            const isAppError = error instanceof AppError
            const title = isAppError ? error.message : 'Não foi possível atualizar as informações'

            toast.show({
                title,
                placement: 'top',
                bgColor: 'red.500'
            })
        } finally {
            setIsSendingData(false)
        }
    }

    return (
        <VStack flex={1}>
            <ScreenHeader
                title="Perfil do usuário"
            />
            <ScrollView contentContainerStyle={{ paddingBottom: 36 }}>
                <Center
                    marginTop={6}
                    paddingX={10}
                >
                    {
                        photoIsLoading ?
                            <Skeleton
                                width={PHOTO_SIZE}
                                height={PHOTO_SIZE}
                                rounded="full"
                                startColor='gray.500'
                                endColor='gray.400'
                            /> :
                            <UserPhoto
                                source={ user.avatar ? { uri: `${api.defaults.baseURL}/avatar/${user.avatar}` } :  defaultUserPhotoImg}
                                alt="Foto do usuário"
                                size={PHOTO_SIZE}
                            />

                    }
                    <TouchableOpacity onPress={handleUserPhotoSelect}>
                        <Text
                            color="green.500"
                            fontWeight="bold"
                            fontSize="md"
                            marginTop={2}
                            marginBottom={8}
                        >
                            Alterar foto
                        </Text>
                    </TouchableOpacity>

                    <Controller
                        control={control}
                        name="name"
                        render={
                            ({ field }) => (
                                <Input
                                    placeholder="Nome"
                                    bg="gray.600"
                                    onChangeText={field.onChange}
                                    value={field.value}
                                    errorMessage={errors.name?.message}
                                />
                            )
                        }
                    />
                    <Controller
                        control={control}
                        name="email"
                        render={({ field }) => (
                            <Input
                                isDisabled
                                bg="gray.600"
                                placeholder="E-mail"
                                value={field.value}
                            />
                        )}
                    />


                    <Heading
                        color='gray.200'
                        fontSize="md"
                        marginTop={12}
                        marginBottom={2}
                        alignSelf="flex-start"
                        fontFamily="heading"
                    >
                        Alterar senha
                    </Heading>

                    <Controller
                        control={control}
                        name="old_password"
                        render={({ field }) => (
                            <Input
                                bg="gray.600"
                                placeholder="Senha antiga"
                                secureTextEntry
                                onChangeText={field.onChange}
                                value={field.value}
                                errorMessage={errors.old_password?.message}
                            />
                        )}
                    />
                    <Controller
                        control={control}
                        name="password"
                        render={({ field }) => (
                            <Input
                                bg="gray.600"
                                placeholder="Nova senha"
                                secureTextEntry
                                onChangeText={field.onChange}
                                value={field.value}
                                errorMessage={errors.password?.message}
                            />
                        )}
                    />
                    <Controller
                        control={control}
                        name="confirm_password"
                        render={({ field }) => (
                            <Input
                                bg="gray.600"
                                placeholder="Confirme nova senha"
                                secureTextEntry
                                onChangeText={field.onChange}
                                value={field.value}
                                errorMessage={errors.confirm_password?.message}
                            />
                        )}
                    />
                    <Button
                        title="Atualizar"
                        marginTop={4}
                        onPress={handleSubmit(handleProfileUpdate)}
                        isLoading={isSendingData}
                    />
                </Center>
            </ScrollView>

        </VStack>
    )
}