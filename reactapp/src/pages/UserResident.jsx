import { gql, useQuery } from '@apollo/client'
import VerifiedUser from './VerifiedUser'
import PuffLoader from 'react-spinners/PuffLoader'
import { Center, Text, Box } from '@chakra-ui/react'

const PendingMessage = () => {
    return (
        <Center m='20'>
            <Text>Your account has not yet been verified</Text>
        </Center>
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
            if(v.resident == address){
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
