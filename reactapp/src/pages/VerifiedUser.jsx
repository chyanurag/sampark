import { useState, useEffect } from 'react';
import { Input, Box, Button, Center, Textarea, Select, Text, Spacer, Flex } from '@chakra-ui/react'
import { useNotification } from '@web3uikit/core'
import { ethers } from 'ethers';
import { PROPOSAL_ABI, PROPOSAL_ADDRESS } from '../constants'
import { uploadJson } from '../utils/ipfs'
import { useQuery, gql } from '@apollo/client'
import PuffLoader from 'react-spinners/PuffLoader'

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
            return <Button onClick={downVoteHandler} p='5' backgroundColor={'#FF0000'} outline={'none'} color={'white'}  fontSize='20' m='10'>Revoke Vote</Button>
        } else {
            return <Button onClick={voteHandler} p='5' backgroundColor={'#4cbb17'} fontSize='20' m='10'>Vote</Button>
        }
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
            <Text fontSize="40" m='10' p='10' fontFamily='Jetbrains Mono' textDecoration={'underline'}><Center>Here are your proposals</Center></Text>
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
        if(!checkTele(tele)){
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
            <Input width='80%' fontSize='30' p='5' m='10' fontFamily='Jetbrains Mono' required={true} type="text" placeholder="Enter title" value={title} onChange={e => setTitle(e.target.value)}/><br/>
            <Textarea rows='10' cols='86' fontSize='20' p='5'  m='10' ontFamily='Jetbrains Mono' required={true} onChange={e => setDesc(e.target.value)} value={desc} type="text" placeholder="Describe your issue"/><br/>
            <Input fontSize='30' p='5'  m='10' ontFamily='Jetbrains Mono' required type='tel' placeholder='Phone number' value={phone} onChange={e => setPhone(e.target.value)}/><br/>
            <Select iconSize={'0'} fontSize='30'  m='10' variant='filled' placeholder='Select Your Location' ontFamily='Jetbrains Mono' onChange={e => setPropLoc(e.target.value)} value={propLoc}>
                <option value='Kandivali'>Kandivali</option>
                <option value='Mira road'>Mira road</option>
                <option value='Andheri'>Andheri</option>
            </Select>
            <Button disabled={uploading} onClick={handleCreate} onMouseOut={e => e.target.style.color='white'} onMouseOver={(e) => e.target.style.color='grey'} fontFamily='Jetbrains Mono' fontSize='20' p='10' m='10' backgroundColor='#051C2C' color='white'>Add Proposal</Button><br/>
            <Button onClick={handleBack} onMouseOut={e => e.target.style.color='white'} onMouseOver={(e) => e.target.style.color='grey'} fontFamily='Jetbrains Mono' fontSize='20' p='10' m='10' backgroundColor='#051C2C' color='white'>Go Back</Button>
        </Box>
    )
}

const UserStats = ({}) => {
    return(
        <Box p='10' m='20'>
            <Text fontSize="50" fontFamily={'Jetbrains Mono'}>Welcome!</Text>
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
        <Box p='20' m='20' border='2px solid black'>
            <Text fontSize='30' fontFamily={'Jetbrains Mono'}>{title}</Text>
            <Text fontSize='20' fontFamily={'Jetbrains Mono'}>Location : {loc}</Text>
            <Text fontSize='20' fontFamily={'Jetbrains Mono'}>Phone : {phone}</Text>
            <Text fontSize="20" fontFamily={'Jetbrains Mono'}>{desc}</Text>
            <Flex m='20' my='20' align={'center'}>
                <Button m='5' mx='20' p='5' my='' fontSize='20' fontFamily={'Jetbrains Mono'} backgroundColor={'#051C2C'} color={'white'} onClick={handleBack}>Back</Button>
                <Button m='5' mx='20' p='5' fontSize='20' fontFamily={'Jetbrains Mono'} backgroundColor={'#051C2C'} color={'white'} onClick={voteHandler}>Vote</Button>
                <Text fontSize="20" fontFamily="Jetbrains Mono">{votes}</Text>
            </Flex>
        </Box>
    )
}

const VerifiedUser = ({address}) => {
    const [createProposal, setCreateProposal] = useState(false);   
    const [community, setCommunity] = useState(false);
    const [singlePro, setSinglePro] = useState(null);

    const dispatch = useNotification();
    useEffect(() => {
        dispatch({
            type: 'success',
            message: 'You have been verified succesfully!',
            title: 'Verification Sucess',
            position: 'topR'
        })
    }, [])

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
            <Button onClick={() => {setCreateProposal(true);setCommunity(false); setSinglePro(null)}} onMouseOut={e => e.target.style.color='white'} onMouseOver={(e) => e.target.style.color='grey'} fontFamily='Jetbrains Mono' fontSize='20' p='10' m='10' backgroundColor='#051C2C' color='white'>Create Proposal</Button>
            <Button onClick={() => {setCreateProposal(false); setCommunity(true); setSinglePro(null)}} onMouseOut={e => e.target.style.color='white'} onMouseOver={(e) => e.target.style.color='grey'} fontFamily='Jetbrains Mono' fontSize='20' p='10' m='10' backgroundColor='#051C2C' color='white'>View Community</Button>
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
