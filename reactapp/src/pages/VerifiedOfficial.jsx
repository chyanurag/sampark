import { gql, useQuery } from '@apollo/client'
import PuffLoader from 'react-spinners/PuffLoader'
import { Center, Box, Text, Spacer, Flex, Button } from '@chakra-ui/react'
import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { PROPOSAL_ABI, PROPOSAL_ADDRESS, RESIDENT_ABI, RESIDENT_ADDRESS } from '../constants';
import { useNotification } from '@web3uikit/core'

const User = ({ verificationHandler, account }) => {
    return(
        <Flex p='10' m='20' mx='20em' border='2px solid black' align={'center'} justify={'space-evenly'}>
            <Box>
            <h1>Address {account.address}</h1>
            <h2>Token {account.tokenId}</h2>
            </Box>
            <Box>
                <Button p='5' fontSize='20' onClick={() => verificationHandler(account.address, account.tokenId)}>Verify</Button>
            </Box>
        </Flex>
    )
}

const UserList = ({ verificationHandler, accounts }) => {
    return(
        <>
            {accounts.map(account => <User key={account} verificationHandler={verificationHandler} account={account}/>)}
        </>
    )
}

const SingleProposal = () => {
    return(
        <h1>Single proposal</h1>
    )
}

const Proposal = () => {
    return(
        <>
        </>
    )
}

const ProposalList = () => {
    return(
        <h1>Proposal list</h1>
    )
}

const VerifiedOfficial = ({ address }) => {
    const [showUsers, setShowUsers] = useState(true);
    const [singleProposal, setSingleProposal] = useState(null);
    const [showProposals, setShowProposals] = useState(null);
    const dispatch = useNotification();
    
    const unVerifiedUsers = gql`
    {
        newRegistrations{
            address
            tokenId
            official
        }
        residentVerifieds{
            resident
            tokenId
        }
    }
    `;

    const { loading, data, error } = useQuery(unVerifiedUsers);

    const verifyUser = async (address, tokenId) => {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const temp = new ethers.Contract('dai.tokens.ethers.eth', RESIDENT_ABI, signer);
        const contract = temp.attach(RESIDENT_ADDRESS);
        try{
            dispatch({
                type: 'info',
                message: 'Verifying resident',
                title: 'Resident verifiction',
                position: 'topR'
            })
            await contract.verifyResident(address, tokenId);
            dispatch({
                type: 'success',
                message: 'Resident Verified Successfully!',
                title: 'Resident Verification',
                position: 'topR'
            })
        } catch(err){
            dispatch({
                type: 'error',
                message: 'Verification Error',
                title: String(err),
                position: 'topR'
            })
        }
    }

    const checkUnverifiedUsers = () => {
        let registrations = data['newRegistrations']
        let verifications = data['residentVerifieds']
        let residents = new Map()
        for(let regs of registrations){
            if(!regs.official){
                residents.set(regs.address, regs.tokenId)
            }
        }
        for(let i of verifications){
            if(residents.has(i.resident)){
                residents.delete(i.resident);
            }
        }
        let accounts = Array.from(residents, ([address, tokenId]) => ({ address, tokenId }));
        return <UserList verificationHandler={verifyUser} accounts={accounts}/>
    }

    return (
        <Box>
            <Box>
                <Button onClick={() => {setShowUsers(true);setShowProposals(false);setSingleProposal(null)}}>Show Users</Button>
                <Button onClick={() => {setShowUsers(false); setShowProposals(true);setSingleProposal(null)}}>Show Proposals</Button>
            </Box>
            {loading ? <Center><PuffLoader my='50' size={200} /></Center> : singleProposal ? <SingleProposal /> : showUsers ?  checkUnverifiedUsers() : <ProposalList />}
        </Box>
    )
}

export default VerifiedOfficial;
