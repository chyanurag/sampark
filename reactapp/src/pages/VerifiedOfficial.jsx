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

const Proposal = ({ contract, index, handleClick }) => {
    const [title, setTitle] = useState('Loading...')
    const [desc, setDesc] = useState('Loading...');
    const [loc, setLoc] = useState('Loading...');
    const [votes, setVotes] = useState('Loading...');
    const [resolved, setResolved] = useState(false);
    const getVoted = gql`
    {
        votedForProposals{
            resident
            index
        }
    }
    `

    const { loading, data, error } = useQuery(getVoted);

    const voteHandler = async () => {
        await contract.voteForProposal(index);
    }

    const populateData = async () => {
        const data = await contract.getProposal(index);
        setVotes(String(data['1']));
        setResolved(data['2']);
        let details = data['3'];
        let response = await fetch('https://ipfs.io/ipfs/'+details)
        let jdetails = await response.json();
        setTitle(jdetails['title'])
        setDesc(jdetails['description'])
        setLoc(jdetails['location'])
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const account = await signer.getAddress();
        setAddress(account);
    }

    useEffect(() => {
        populateData()
    }, [])

    return (
        <Box p='20' m='20' border='2px solid black' onClick={() => handleClick(index)} fontSize='30' className='proposal' backgroundColor={resolved ? '#AAFF00' : '#FF474D'} color={resolved ? 'black' : 'white'}>
            <Flex align={'center'}>
                <Text fontSize="20" fontFamily="Jetbrains Mono">{title}</Text>
                <Spacer />
                <Spacer />
                <Spacer />
                <Text fontSize="20" fontFamily="Jetbrains Mono">{votes}</Text>
            </Flex>
        </Box>
    )
}

const UserProps = ({ props, handleClick }) => {
    const [contract, setContract] = useState(null);

    const populateContract = async () => {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const temp = new ethers.Contract('dai.tokens.ethers.eth', PROPOSAL_ABI, signer);
        const contract = temp.attach(PROPOSAL_ADDRESS);
        setContract(contract);
    }
    
    useEffect(() => {
        populateContract();
    }, [])


    return(
        <Box m='30' p='20'>
            {contract ? props.map((pr, idx) => <Proposal handleClick={handleClick} key={idx} contract={contract} index={pr}/>) : <Text fontFamily={'Jetbrains Mono'}>fetching data</Text>}
        </Box>
    )
}

const ProposalList = ({ handleClick }) => {
    const [address, setAddress] = useState('');

    const populateAddress = async () => {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const address = await signer.getAddress();
        setAddress(address);
    }
    
    useEffect(() => {
        populateAddress()
    }, [])
    
    const proposalsQuery = gql`
    {
        proposalCreateds{
            resident
            index
        }
    }
    `;

    const { loading, data, error } = useQuery(proposalsQuery)

    const loadProposals = () => {
        const userProps = [];
        let proposals = data['proposalCreateds'];
        for(let prop of proposals){
            userProps.push(prop.index);
        }
        return <UserProps handleClick={handleClick} address={address} props={userProps}/>
    }

    return(
        <>
            {loading ? <Center my='50'><PuffLoader size={150}/></Center> : loadProposals()}
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
    }

    useEffect(() => {
        populateData()
    }, [])

    return (
        <Box p='20' m='20' border='2px solid black'>
            <Text fontSize='30' fontFamily={'Jetbrains Mono'}>{title}</Text>
            <Text fontSize="20" fontFamily={'Jetbrains Mono'}>{desc}</Text>
            <Flex m='20' my='20' align={'center'}>
                <Button m='5' mx='20' p='5' my='' fontSize='20' fontFamily={'Jetbrains Mono'} backgroundColor={'#051C2C'} color={'white'} onClick={handleBack}>Back</Button>
                <Button m='5' mx='20' p='5' fontSize='20' fontFamily={'Jetbrains Mono'} backgroundColor={'#051C2C'} color={'white'} onClick={voteHandler}>Vote</Button>
                <Text fontSize="20" fontFamily="Jetbrains Mono">{votes}</Text>
            </Flex>
        </Box>
    )
}

const UserList = ({ verificationHandler, accounts }) => {
    return(
        <>
            {accounts.map(account => <User key={account} verificationHandler={verificationHandler} account={account}/>)}
        </>
    )
}

const VerifiedOfficial = ({ address }) => {
    const [showUsers, setShowUsers] = useState(true);
    const [singleProposal, setSingleProposal] = useState(null);
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
    const clickHandler = (i) => {
        setSinglePro(i)
        setShowUsers(false);
    }

    return (
        <Box>
            <Box>
                <Button onClick={() => {setShowUsers(true);setShowProposals(false);}}>Show Users</Button>
                <Button onClick={() => {setShowUsers(false); setShowProposals(true)}}>Show Proposals</Button>
            </Box>
            {loading ? <Center><PuffLoader my='50' size={200} /></Center> : showUsers ? checkUnverifiedUsers() : singleProposal ? <SingleProposal handleBack={() => setSingleProposal(null)} index={singleProposal}/> : <ProposalList handleClick={clickHandler} />}
        </Box>
    )
}

export default VerifiedOfficial;
