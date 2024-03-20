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

const SingleProposal = ({ index }) => {
    return(
        <>
            <h1>Single proposal of index {index}</h1>
        </>
    )
}

const Proposal = ({ handleClick, contract, index}) => {
    const [title, setTitle] = useState('Loading...');
    const [desc, setDesc] = useState('Loading...');
    const [phone, setPhone] = useState('Loading...');
    const [votes, setVotes] = useState('Loading...');
    const [resolved, setResolved] = useState(false);
    const dispatch = useNotification();

    const fetchProposal = async () => {
        const prop = await contract.getProposal(index);
        let dataUrl = prop['3']
        let resp = await fetch('https://ipfs.io/ipfs/'+dataUrl)
        let data = await resp.json();
        setTitle(data['title'])
        setDesc(data['description'])
        setPhone(data['phone'])
        setVotes(String(prop['1']));
        setResolved(prop['2']);
    }
    useEffect(() => {
        fetchProposal()
    }, [])

    const markResolved = async () => {
        try{
            await contract.markProposalAsResolved(index)
            dispatch({
                type: 'success',
                message: 'Prposal Resolved',
                title: 'Proposal marked as resolved',
                position: 'topR'
            })
        } catch (err) {
            dispatch({
                type: 'error',
                message: String(err),
                title: 'Something went wrong',
                position: 'topR'
            })
        }
    }

    return(
        <Box mx='100' onClick={handleClick}>
            <Flex mx='100' border='1px solid black' p='20' align={'center'} backgroundColor={resolved ? '#AAFF00' : '#FF474D'} m='20' justify={'space-evenly'}>
                <Text fontSize="20">
                    {title}
                </Text>
                <Spacer />
                <Text fontSize='20'>
                    {votes}
                </Text>
                { !resolved ? <Button m='5' p='5' mx='30' fontSize={'20'} backgroundColor={'#051C2C'} color={"white"} onClick={markResolved}>Mark Resolved</Button> : null}
            </Flex>
        </Box>
    )
}

const ProposalList = ({ handleClick }) => {
    const [contract, setContract] = useState([]);

    const allProducts = gql`
    {
        proposalCreateds{
            resident
            index
        }
    }
    `;

    const populateContracts = async () => {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const temp = new ethers.Contract('dai.tokens.ethers.eth', PROPOSAL_ABI, signer);
        const contract = temp.attach(PROPOSAL_ADDRESS)
        setContract(contract)
    }

    useEffect(() => {
        populateContracts()
    }, [])

    const { loading, data, error } = useQuery(allProducts);

    const fetchProps = () => {
        let proposals = data['proposalCreateds'];
        return (<Box>
                {proposals.map(prop => <Proposal handleClick={handleClick} key={prop.index} contract={contract} index={prop.index}/>)}
            </Box>
        )
    }

    return(
        <>
            {loading ? <PuffLoader /> : fetchProps()}
        </>
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

    const handleClick = (idx) => {
        setSingleProposal(idx)
    }

    return (
        <Box>
            <Center m='10' p='10'>
                <Button backgroundColor={'#051C2C'} fontSize='20' color={'white'} m='20' p='10' onClick={() => {setShowUsers(true);setShowProposals(false);setSingleProposal(null)}}>Show Users</Button>
                <Button backgroundColor={'#051C2C'}  fontSize='20' color={'white'} m='20' p='10' onClick={() => {setShowUsers(false); setShowProposals(true);setSingleProposal(null)}}>Show Proposals</Button>
            </Center>
            {loading ? <Center><PuffLoader my='50' size={200} /></Center> : singleProposal ? <SingleProposal index={idx} /> : showUsers ?  checkUnverifiedUsers() : <ProposalList handleClick={handleClick} />}
        </Box>
    )
}

export default VerifiedOfficial;
