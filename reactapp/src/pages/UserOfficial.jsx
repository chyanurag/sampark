import { gql, useQuery } from '@apollo/client'
import VerifiedOfficial from './VerifiedOfficial'
import { Text, Center, Image, Box } from '@chakra-ui/react'
import PuffLoader from 'react-spinners/PuffLoader'
import ImageFour from '../images/img4.svg'

const PendingMessage = () => {
    return (
        <Box m='20'>
            <Center><Image width={380} height={380} m='40' src={ImageFour}/></Center>
            <Center><Text fontFamily={'Jetbrains Mono'} fontSize='20'>Your account has not yet been verified</Text></Center>
            
        </Box>
    )
}

const UserOfficial = ({ address }) => {
    const officialVerifier = gql`
    {
        officialVerifieds{
            official
        }
    }
    `

    const { loading, data, error } = useQuery(officialVerifier);

    const checkVerification = () => 
    {
        let verifications = data['officialVerifieds']
        for(let v of verifications){
            if(v.official == address){
                return <VerifiedOfficial address={address}/>
            }
        }
        return <PendingMessage />
    }

    return (
        <>
            {loading ? <Center><PuffLoader my='20' size={200}/></Center> : checkVerification() }
        </>
    )
}

export default UserOfficial;
