import { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { VStack, SectionList, Heading, Text, useToast } from 'native-base';
import { HistoryCard } from '@components/HistoryCard';
import { ScreenHeader } from '@components/ScreenHeader';
import { AppError } from '@utils/AppError';
import { api } from '@services/api';
import { HistoryGroupDTO } from '@dtos/HistoryGroupDTO';
import { Loading } from '@components/Loading';

export function History() {
    const toast = useToast()
    const [isLoading, setIsLoading] = useState(true)

    const [exercises, setExercises] = useState<HistoryGroupDTO[]>([])

    async function fetchHistory() {
        try {
            setIsLoading(true)
            const response = await api.get('/history')
            setExercises(response.data)
        } catch (error) {
            const isAppError = error instanceof AppError
            const title = isAppError ? error.message : 'Não foi possível carregar o histórico.'

            toast.show({
                title,
                placement: 'top',
                bgColor: 'red.500'
            })
        } finally {
            setIsLoading(false)
        }
    }

    useFocusEffect(useCallback(() => {
        fetchHistory()
    }, []))

    return (
        <VStack flex={1}>
            <ScreenHeader
                title="Histórico de exercícios"
            />
            {
                isLoading ? <Loading /> :

                    <SectionList
                        sections={exercises}
                        keyExtractor={item => item.id}
                        renderItem={({ item }) => (
                            <HistoryCard
                                data={item}
                            />
                        )}
                        renderSectionHeader={({ section }) => (
                            <Heading
                                color="gray.200"
                                fontSize="md"
                                marginTop={10}
                                marginBottom={3}
                                fontFamily="heading"
                            >
                                {section.title}
                            </Heading>
                        )}
                        paddingX={8}
                        contentContainerStyle={
                            exercises.length === 0 && { flex: 1, justifyContent: 'center' }
                        }
                        ListEmptyComponent={() => (
                            <Text color="gray.100" textAlign="center">
                                Não há exercícios registrados ainda.{'\n'}
                                Vamos treinar hoje?
                            </Text>
                        )}
                        showsVerticalScrollIndicator={false}
                    />
            }

        </VStack>
    )
}