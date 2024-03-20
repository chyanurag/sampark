import { gql, useQuery } from '@apollo/client'
import PuffLoader from 'react-spinners/PuffLoader'
import { Center, Box, Text, Spacer, Flex, Button } from '@chakra-ui/react'
import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { PROPOSAL_ABI, PROPOSAL_ADDRESS, RESIDENT_ABI, RESIDENT_ADDRESS } from '../constants';
import { useNotification } from '@web3uikit/core'

const User = ({ verificationHandler, account }) => {
    return(
        <Flex p='10' m='20' mx='20em' border='2px solid lightgray' borderRadius={'14'} align={'center'} justify={'space-evenly'}>
            <Box>
            <Flex p='14'><Text color={'#404040'}>Address</Text>&nbsp;<Text><b>{account.address}</b></Text></Flex>
            <Flex p='14'><Text color={'#404040'}>Token</Text>&nbsp;<Text><b>{account.tokenId}</b></Text></Flex>
            </Box>
            <Box>
                <Button p='5' border={'none'} borderRadius={'50'} px='20' fontSize='18' backgroundColor={'lightgreen'} color={'#11111'} onClick={() => verificationHandler(account.address, account.tokenId)}>Verify</Button>
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

const SingleProposal = ({ index, handleBack }) => {
    const [title, setTitle] = useState('Loading...')
    const [desc, setDesc] = useState('Loading...');
    const [loc, setLoc] = useState('Loading...');
    const [votes, setVotes] = useState('Loading...');
    const [resolved, setResolved] = useState(false);
    const [contract, setContract] = useState(null);
    const [address, setAddress] = useState(null);
    const dispatch = useNotification();
    const [phone, setPhone] = useState('');

    const voteHandler = async () => {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const temp = new ethers.Contract('dai.tokens.ethers.eth', PROPOSAL_ABI, signer);
        const contract = temp.attach(PROPOSAL_ADDRESS);
        try{
            await contract?.voteForProposal(index);
            dispatch({
                type: 'success',
                title: 'Vote successfull!',
                message: 'Voted sucessfully!',
                position: 'topR'
            })
        } catch (err) {
            dispatch({
                type: 'error',
                title: 'Vote unsuccessfull!',
                message: 'Already Voted!',
                position: 'topR'
            })
        }
    }

    const populateData = async () => {
        const provider = new ethers.BrowserProvider(window.ethereum)
        const signer = await provider.getSigner();
        const address = await signer.getAddress();
        setAddress(address);
        const temp = new ethers.Contract('dai.tokens.ethers.eth', PROPOSAL_ABI, signer);
        const contract = temp.attach(PROPOSAL_ADDRESS);
        const data = await contract.getProposal(index);
        setVotes(String(data['1']));
        setResolved(data['2']);
        let details = data['3'];
        let response = await fetch('https://ipfs.io/ipfs/'+details)
        let jdetails = await response.json();
        setTitle(jdetails['title'])
        setDesc(jdetails['description'])
        setLoc(jdetails['location'])
        setPhone(jdetails['phone'])
    }

    useEffect(() => {
        populateData()
    }, [])

    return (
        <Box m='20' p='20' border='2px solid black'>
            <Text fontSize='18' fontFamily={'Jetbrains Mono'}><b>{title}</b></Text>
            <Text fontSize='18' fontFamily={'Jetbrains Mono'} color='grey'>Votes : {votes}</Text>
            <Text fontSize='18' fontFamily={'Jetbrains Mono'} color='grey'>Location : {loc}</Text>
            <Text fontSize='18' fontFamily={'Jetbrains Mono'} color={'grey'}>Phone : {phone}</Text>
            <Text fontSize="18" fontFamily={'Jetbrains Mono'}>{desc}</Text>
            <Flex align={'center'} my='20'>
                <Button p='5' fontSize='18' mr='10' fontFamily={'Jetbrains Mono'} border={'none'} backgroundColor={'lightblue'} borderRadius={'50'} px='20' color={'#111111'} onClick={handleBack}>Back</Button>
                <Button p='5' fontSize='18' ml='10' mr='10' fontFamily={'Jetbrains Mono'} border={'none'} backgroundColor={'lightblue'} borderRadius={'50'} px='20' color={'#11111'} onClick={voteHandler}>Vote</Button>
            </Flex>
        </Box>
    )
}
const Proposal = ({ handleClick, contract, index }) => {
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

    return (
        <Flex onClick={() => handleClick(index)} px='20' py='20' m='20' mx='20em' border='2px solid lightgray' borderRadius={'14'} justify={'space-between'}>
            <Box>
                <Text>{title}</Text>
                <Text color={'#404040'}>Votes <b>{votes}</b></Text>
            </Box>
            <Box>
                <Button p='5' border={'none'} borderRadius={'50'} px='20' fontSize='18' backgroundColor={ resolved ? 'lightgreen' : '#fd5c63' } color={'#11111'} onClick={() => markResolved()}>{resolved ? 'Resolved' : 'Resolve'}</Button>
            </Box>
        </Flex>
    )
}

const ProposalList = ({ handleClick }) => {
    const [contract, setContract] = useState(null);

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
        if(!contract){
            populateContracts()
        }
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
                <Button backgroundColor={'lightblue'} border={'none'} borderRadius={'50'} px='30' fontSize='20' color={'#11111'} m='20' py='10' onClick={() => {setShowUsers(true);setShowProposals(false);setSingleProposal(null)}}>Show Users</Button>
                <Button backgroundColor={'lightblue'} border={'none'} borderRadius={'50'} px='30'  fontSize='20' color={'#11111'} m='20' py='10' onClick={() => {setShowUsers(false); setShowProposals(true);setSingleProposal(null)}}>Show Proposals</Button>
            </Center>
            {loading ? <Center><PuffLoader my='50' size={200} /></Center> : singleProposal ? <SingleProposal handleBack={() => setSingleProposal(null)} index={singleProposal} /> : showUsers ?  checkUnverifiedUsers() : <ProposalList handleClick={handleClick} />}
        </Box>
    )
}

export default VerifiedOfficial;
