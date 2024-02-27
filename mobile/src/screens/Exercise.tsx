import { useEffect, useState } from 'react';
import { Box, HStack, Heading, Icon, Image, Text, VStack, ScrollView, useToast, Skeleton } from 'native-base';
import { TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons'
import { useNavigation, useRoute } from '@react-navigation/native';
import { AppNavigatorRoutesProps } from "@routes/app.routes";

import BodySvg from '@assets/body.svg'
import SeriesSvg from '@assets/series.svg'
import RepetitionSvg from '@assets/repetitions.svg'
import { Button } from "@components/Button";
import { api } from "@services/api";
import { AppError } from "@utils/AppError";
import { ExerciseDTO } from '@dtos/ExerciseDTO';
import { Loading } from '@components/Loading';

type RouteParams = {
    exerciseId: string
}

export function Exercise() {
    const [isSendingRegister, setIsSendingRegister] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const [exercise, setExercise] = useState<ExerciseDTO>({} as ExerciseDTO)
    const navigation = useNavigation<AppNavigatorRoutesProps>()
    const route = useRoute()

    const toast = useToast()

    const { exerciseId } = route.params as RouteParams

    function handleGoBack() {
        navigation.goBack()
    }

    async function handleExerciseHistoryRegister() {
        try {
            setIsSendingRegister(true)
            await api.post('/history', { exercise_id: exerciseId })

            toast.show({
                title: 'Parabéns! Exercício registrado no seu histórico.',
                placement: 'top',
                bgColor: 'green.700'
            })

            navigation.navigate('history')
        } catch (error) {
            const isAppError = error instanceof AppError
            const title = isAppError ? error.message : 'Não foi possível registrar o exercício'

            toast.show({
                title,
                placement: 'top',
                bgColor: 'red.500'
            })
        } finally {
            setIsSendingRegister(false)
        }
    }


    async function fetchExerciseDetails() {
        try {
            setIsLoading(true)
            const response = await api.get(`/exercises/${exerciseId}`)
            setExercise(response.data)
        } catch (error) {
            const isAppError = error instanceof AppError
            const title = isAppError ? error.message : 'Não foi possível carregar os detalhes do exercício'

            toast.show({
                title,
                placement: 'top',
                bgColor: 'red'
            })
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchExerciseDetails()
    }, [exerciseId])

    return (
        <VStack flex={1}>

            <VStack
                paddingX={8}
                backgroundColor="gray.600"
                paddingTop={12}
            >
                <TouchableOpacity
                    onPress={handleGoBack}
                >
                    <Icon
                        as={Feather}
                        name="arrow-left"
                        color="green.500"
                        size={6}
                    />
                </TouchableOpacity>
                <HStack
                    marginTop={4}
                    marginBottom={8}
                    justifyContent="space-between"
                    alignItems="center"
                >
                    <Heading
                        color="gray.100"
                        fontSize="lg"
                        flexShrink={1}
                    >
                        {exercise.name}
                    </Heading>
                    <HStack>
                        <BodySvg />
                        <Text
                            color="gray.200"
                            marginLeft={1}
                            textTransform="capitalize"
                        >
                            {exercise.group}
                        </Text>
                    </HStack>
                </HStack>
            </VStack>
            <ScrollView>
                <VStack padding={8}>
                    <Box rounded="lg" marginBottom={3} overflow='hidden'>
                        {
                            isLoading ?
                                <Skeleton
                                    width="full"
                                    height={80}
                                    startColor='gray.500'
                                    endColor='gray.400'
                                /> :
                                <Image
                                    width="full"
                                    height={80}
                                    alt="Nome do exercicio"
                                    source={{ uri: `${api.defaults.baseURL}/exercise/demo/${exercise.demo}` }}
                                    resizeMode="cover"
                                />
                        }
                    </Box>

                    {
                        isLoading ?
                            <Skeleton rounded="md" startColor='gray.500'
                                endColor='gray.400' width="full" height={32} />
                            :
                            <Box backgroundColor="gray.600" rounded="md" paddingBottom={4} paddingX={4}>
                                <HStack alignItems="center" justifyContent="space-around" marginBottom={6} marginTop={5}>
                                    <HStack>
                                        <SeriesSvg />
                                        <Text color="gray.200" marginLeft={2}>{exercise.series} séries</Text>
                                    </HStack>
                                    <HStack>
                                        <RepetitionSvg />
                                        <Text color="gray.200" marginLeft={2}>{exercise.repetitions} repetições</Text>
                                    </HStack>
                                </HStack>
                                <Button
                                    title="Marcar como realizado"
                                    isLoading={isSendingRegister}
                                    onPress={handleExerciseHistoryRegister}
                                />
                            </Box>
                    }
                </VStack>
            </ScrollView>
        </VStack>
    )
}