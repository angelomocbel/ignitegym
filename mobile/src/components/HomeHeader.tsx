import { Alert, TouchableOpacity } from 'react-native'
import { HStack, Heading, Text, VStack, Icon } from 'native-base'
import { MaterialIcons } from '@expo/vector-icons'

import { useAuth } from '@hooks/useAuth'
import { UserPhoto } from "./UserPhoto"
import defaultUserPhotoImg from '@assets/userPhotoDefault.png'
import { api } from '@services/api'

export function HomeHeader() {
    const { user, signOut } = useAuth()

    function handleSignOut(){
        Alert.alert('Saindo', 'Deseja sair da sua conta?', [
            {
                text: 'Cancelar',
            },
            {
                text: 'Sair', onPress: signOut
            }
        ])
    }
    return (
        <HStack bg='gray.600' pt={16} pb={5} px={8} alignItems='center' >
            <UserPhoto
                source={ user.avatar ? { uri: `${api.defaults.baseURL}/avatar/${user.avatar}` } : defaultUserPhotoImg}
                size={16}
                alt='Foto de perfil do usuário'
                mr={4}
            />
            <VStack flex={1}>
                <Text color='gray.100' fontSize='md'>
                    Olá,
                </Text>
                <Heading color='gray.100' fontSize='md' fontFamily="heading">
                    {user.name}
                </Heading>
            </VStack>


            <TouchableOpacity onPress={handleSignOut}>
                <Icon
                    as={MaterialIcons}
                    name='logout'
                    color='gray.200'
                    size={7}
                />
            </TouchableOpacity>
        </HStack>
    )
}