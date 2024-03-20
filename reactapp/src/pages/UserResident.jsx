import { gql, useQuery } from '@apollo/client'
import VerifiedUser from './VerifiedUser'
import PuffLoader from 'react-spinners/PuffLoader'
import { Center, Text, Box, Image } from '@chakra-ui/react'
import ImageFour from '../images/img4.svg'

const PendingMessage = () => {
    return (
        <Box m='20'>
            <Center><Image width={380} height={380} m='40' src={ImageFour}/></Center>
            <Center><Text fontFamily={'Jetbrains Mono'} fontSize='20'>Your account has not yet been verified</Text></Center>
            
        </Box>
    )
}

const UserResident = ({ address }) => {
    const residentVerifier = gql`
    {
        residentVerifieds{
            resident
        }
    }
    `

    const { loading, data, error } = useQuery(residentVerifier);

    const checkVerification = () => 
    {
        let verifications = data['residentVerifieds']
        for(let v of verifications){
            if(String(v.resident).toLowerCase() == String(address).toLowerCase()){
                return <VerifiedUser address={address}/>
            }
        }
        return <PendingMessage />
    }

    return (
        <>
            {loading ? <Center my='50'>
                    <Box><PuffLoader size={200}/></Box>
                </Center> : checkVerification() }
        </>
    )
}

export default UserResident;
