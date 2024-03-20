import { useState, useEffect } from 'react';
import { Input, Box, Button, Center, Textarea, Select, Text, Spacer, Flex } from '@chakra-ui/react'
import { useNotification } from '@web3uikit/core'
import { ethers } from 'ethers';
import { PROPOSAL_ABI, PROPOSAL_ADDRESS, RESIDENT_ABI, RESIDENT_ADDRESS } from '../constants'
import { uploadJson } from '../utils/ipfs'
import { useQuery, gql } from '@apollo/client'
import PuffLoader from 'react-spinners/PuffLoader'
import { Contract } from '@web3uikit/icons';

const Proposal = ({ contract, index, showVote, handleClick }) => {
    const [title, setTitle] = useState('Loading...')
    const [desc, setDesc] = useState('Loading...');
    const [loc, setLoc] = useState('Loading...');
    const [votes, setVotes] = useState('Loading...');
    const [resolved, setResolved] = useState(false);
    const [address, setAddress] = useState(null);
    const [voted, setVoted] = useState(false);
    const dispatch = useNotification();

    const getVoted = gql`
    {
        votedForProposals{
            resident
            index
        }
        revokedVotedForProposals{
            resident
            index
        }
    }
    `

    const { loading, data, error } = useQuery(getVoted);

    const downVoteHandler = async () => {
        try{
            await contract.revokeVoteForProposal(index);
            dispatch({
                type: 'success',
                title: 'Downvote sucessful',
                message: 'Revoked vote suceessfully',
                position: 'topR'
            })
        }
        catch(err){
            dispatch({
                type: 'error',
                title: 'Something went wrong',
                message: String(err),
                GeolocationPosition: 'topR'
            })
        }
    }

    const voteHandler = async () => {
        try{
            await contract.voteForProposal(index);
        }catch(err){

        }
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

    const checkIfVoted = () => {
        let resp = data['votedForProposals'];
        let revoked = data['revokedVotedForProposals'];
        let voteCount = 0;
        let revokeCount = 0;
        for(let r of resp){
            if(r.index == index){
                if(r.resident == String(address).toLowerCase()){
                    voteCount++;
                }
            }
        }
        for(let r of revoked){
            if(r.index == index){
                if(r.resident == String(address).toLowerCase()){
                    revokeCount++;
                }
            }
        }
        let check = voteCount > revokeCount;
        if(check){
            return <Button onClick={downVoteHandler} p='5' backgroundColor={'#FF0000'} outline={'none'} color={'white'} borderRadius={'50'} px='20' border={'none'} fontSize='20' m='10'>Revoke Vote</Button>
        } else {
            return <Button onClick={voteHandler} p='5' backgroundColor={'lightgreen'} fontSize='20' m='10' color={''} borderRadius={'50'} px='20' border='none'>Vote</Button>
        }
    }

    useEffect(() => {
        populateData()
    }, [])

    return (
        <Box p='20' m='20' border='1px solid black' borderRadius={'12'} onClick={() => handleClick(index)} fontSize='30' className='proposal'>
            <Flex align={'center'}>
                <Text fontSize="20" fontFamily="Jetbrains Mono">{title}</Text>
                <Spacer />
                <Spacer />
                <Spacer />
                <Text fontSize="20" fontFamily="Jetbrains Mono">{votes}</Text>
                {showVote ? loading ? <Text>Checking</Text> : checkIfVoted(): null}
            </Flex>
        </Box>
    )
}

const UserProps = ({ created, props, handleClick }) => {
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
        <Box>
            <Flex justify={'space-evenly'}>
                <Text>Total proposals : {created}</Text>
            </Flex>
            <Box m='30' p='20'>
                {contract ? props.map((pr, idx) => <Proposal handleClick={handleClick} key={idx} contract={contract} index={pr}/>) : <Text fontFamily={'Jetbrains Mono'}>fetching data</Text>}
            </Box>
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
        let created = 0;
        let resolved = 0;
        for(let prop of proposals){
            if(prop.resident.toLowerCase() == address.toLowerCase()){
                userProps.push(prop.index);
                created++;
            }
        }
        return <UserProps created={created} handleClick={handleClick} address={address} props={userProps}/>
    }

    return(
        <>
            <Text fontSize="40" m='10' p='10' fontFamily='Jetbrains Mono' textDecoration={'none'}><Center>Here are your proposals</Center></Text>
            {loading ? <Center my='50'><PuffLoader size={150}/></Center> : loadProposals()}   
        </>
    )
}


const NewProposal = ({ handleBack }) => {
    const dispatch = useNotification();
    const [title, setTitle] = useState('');
    const [desc, setDesc] = useState('');
    const [phone, setPhone] = useState('');
    const [propLoc, setPropLoc] = useState('');
    const [uploading, setUploading] = useState(false);

    const checkTele = (tele) => {
        return String(tele).match(/^[789]\d{9}$/gi);
    }

    const handleCreate = async () => {
        if(title.trim().length < 30){
            dispatch({
                type: 'error',
                message: 'Title must be at least 30 characters long',
                title: 'Input error',
                position: 'topR'
            })
            return;
        }
        if(desc.trim().length < 50){
            dispatch({
                type: 'error',
                message: 'Description must be at least 50 characters',
                title: 'Input error',
                position: 'topR'
            })
            return;
        }
        if(!propLoc){
            dispatch({
                type: 'error',
                message: 'Please enter your location',
                title: 'Input error',
                position: 'topR'
            })
            return;
        }
        if(!checkTele(phone)){
            dispatch({
                type: 'error',
                message: 'Please input a valid phone number',
                title: 'Input error',
                position: 'topR'
            })
            return;
        }
        setUploading(true)
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const tempCo = new ethers.Contract("dai.tokens.ethers.eth", PROPOSAL_ABI, signer)
        const proposalContract = tempCo.attach(PROPOSAL_ADDRESS);
        dispatch({
            type: 'info',
            message: 'Uploading data to ipfs',
            title: 'Proposal Creation',
            position: 'topR'
        })
        let address = await signer.getAddress();
        const hash = await uploadJson({
            title: title,
            description: desc,
            phone: phone,
            location: propLoc
        })
        try{
        await proposalContract.createProposal(hash);
            dispatch({
                type: 'success',
                message: 'Your proposal has been added',
                title: 'Proposal Success',
                position: 'topR'
            })
            setUploading(false);
            handleBack()
        } catch(err){
            console.error(err)
            dispatch({
                type: 'error',
                title: 'Proposal Creation',
                message: String(err),
                position: 'topR'
            })
            setUploading(false)
        }
    }

    return(
        <Box p='20' m='50' width='80%'>
            <Input width='80%' fontSize='18' p='5' m='10' fontFamily='Jetbrains Mono' required={true} type="text" placeholder="Enter complaint title" value={title} onChange={e => setTitle(e.target.value)}/><br/>
            <Textarea rows='10' cols='86' fontSize='18' p='5'  m='10' ontFamily='Jetbrains Mono' required={true} onChange={e => setDesc(e.target.value)} value={desc} type="text" placeholder="Describe your issue"/><br/>
            <Input fontSize='18' p='5'  m='10' fontFamily='Jetbrains Mono' required type='tel' placeholder='Phone number' value={phone} onChange={e => setPhone(e.target.value)}/><br/>
            <Select iconSize={'0'} fontSize='18'  m='10' variant='filled' placeholder='Select Your Location' ontFamily='Jetbrains Mono' onChange={e => setPropLoc(e.target.value)} value={propLoc}>
                <option value='Kandivali'>Kandivali</option>
                <option value='Mira road'>Mira road</option>
                <option value='Andheri'>Andheri</option>
            </Select>
            <Flex>
                <Button onClick={handleCreate} fontFamily='Jetbrains Mono' fontSize='18' p='10' m='10' backgroundColor='lightblue' borderRadius={'50'} px='20' border={'none'}><Text color='#111111'>Add Proposal</Text></Button><br/>
                <Button onClick={handleBack} fontFamily='Jetbrains Mono' fontSize='18' p='10' m='10' borderRadius={'50'} px='50' backgroundColor={'lightblue'} border={'none'}><Text color='#111111'>Go Back</Text></Button>
            </Flex>
        </Box>
    )
}

const UserStats = ({ address }) => {

    const [name, setName] = useState('....')

    const fetchUri = async () => {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const temp = new ethers.Contract('dai.tokens.ethers.eth', RESIDENT_ABI, signer);
        const contract = temp.attach(RESIDENT_ADDRESS);
        let tokenId = 0;
        for(let i = 1; i < 30; i++){
            const owner = await contract.ownerOf(i);
            if(String(owner).toLowerCase() == String(address).toLowerCase()){
                tokenId = i;
                break;
            }
        }
        const uri = await contract.tokenURI(tokenId);
        let resp = await fetch('https://ipfs.io/ipfs/' + uri)
        let jsonResp = await resp.json();
        setName(String(jsonResp['name']).split(' ')[0])
    }


    useEffect(() => {
        fetchUri();
    }, [])
    return(
        <Box p='10' m='20'>
            <Text fontSize="50" fontFamily={'Jetbrains Mono'}>Welcome {name}!</Text>
        </Box>
    )
}

const CommunityProps = ({ handleClick }) => {
    const [contract, setContract] = useState(null);

    const getAllProps = gql`
    {
        proposalCreateds(first: 25){
            index
        }
    }
    `
    const { loading, data, error } = useQuery(getAllProps);

    async function populateContract(){
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner()
        const temp = new ethers.Contract('dai.tokens.ethers.eth', PROPOSAL_ABI, signer)
        const contract = temp.attach(PROPOSAL_ADDRESS)
        setContract(contract);
    }

    function afterLoading(){
        let props = data['proposalCreateds']
        return (contract ? props.map((pr, idx) => <Proposal handleClick={handleClick} key={idx} contract={contract} index={pr.index} showVote={true}/>) : <PuffLoader size={150}/>);
    }

    useEffect(() => {
        populateContract();
    }, [])

    return (
        <Box m='30' p='20'>
            {loading ? <PuffLoader />  : afterLoading()}
        </Box>
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

const VerifiedUser = ({address}) => {
    const [createProposal, setCreateProposal] = useState(false);   
    const [community, setCommunity] = useState(false);
    const [singlePro, setSinglePro] = useState(null);

    const dispatch = useNotification();


    const clickHandler = (i) => {
        setSinglePro(i)
        setCommunity(false);
        setCreateProposal(false);
    }

    return (
        <Box m='20'>
        <Flex p='5' m='20' align='center'>
            <UserStats address={address}/>
            <Spacer />
            <Button onClick={() => {setCreateProposal(true);setCommunity(false); setSinglePro(null)}}  borderRadius={'50'} border={'none'} px='20' fontFamily='Jetbrains Mono' fontSize='20' py='10' m='10' backgroundColor='lightblue' color='#111111'>Create Proposal</Button>
            <Button onClick={() => {setCreateProposal(false); setCommunity(true); setSinglePro(null)}}  fontFamily='Jetbrains Mono' fontSize='20' py='10' px='20' m='10' borderRadius={'50'} backgroundColor='lightblue' color='#11111' border={'none'}>View Community</Button>
        </Flex>
        {
            createProposal ?
                <NewProposal handleBack={() => setCreateProposal(false)}/>
            :
            community ? <CommunityProps handleClick={clickHandler}/> : singlePro ? <SingleProposal index={singlePro} handleBack={() => setSinglePro(null)}/> : <ProposalList handleClick={clickHandler}/>
        }
        </Box>
    )
}

export default VerifiedUser;
