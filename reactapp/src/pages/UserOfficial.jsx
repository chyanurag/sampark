import { gql, useQuery } from '@apollo/client'
import VerifiedOfficial from './VerifiedOfficial'
import { Text, Center } from '@chakra-ui/react'
import PuffLoader from 'react-spinners/PuffLoader'

const PendingMessage = () => {
    return (
        <Center>
            <Text>You are not verified yet</Text>
        </Center>
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
