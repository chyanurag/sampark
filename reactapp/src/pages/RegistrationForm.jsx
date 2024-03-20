import { Button, Box, Flex, Image, Input, Select } from '@chakra-ui/react'
import { RESIDENT_ABI, RESIDENT_ADDRESS, GOVERNMENT_ABI, GOVERNMENT_ADDRESS } from '../constants'
import { useNotification } from '@web3uikit/core'
import { ethers } from 'ethers';
import ImageOne from '../images/img1.svg'
import { useState } from 'react';
import Modal from 'react-modal'
import { uploadJson } from '../utils/ipfs';

const customStyles = {
    content: {
      top: '50%',
      left: '50%',
      right: 'auto',
      bottom: 'auto',
      marginRight: '-50%',
      transform: 'translate(-50%, -50%)',
    },
  };

const RegistrationForm = () => {
    const dispatch = useNotification();

    const [residentModal, setResidentModal] = useState(false);
    const [officialModal, setOfficialModal] = useState(false);

    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [age, setAge] = useState('');
    const [department, setDepartment] = useState('');


    const registerAsResident = async () => {
        if(name.trim().legnth === 0 || phone.trim().length !== 10 || age.trim().length < 2){
            dispatch({
                type: 'error',
                title: 'Register error',
                message: 'Please provide correct details',
                position: 'topR'
            })
            return;
        }
        dispatch({
            type: 'info',
            title: 'Registering as resident',
            message: 'Please wait',
            position: 'topR'
        })
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner()
        const temp = new ethers.Contract('dai.tokens.ethers.eth', RESIDENT_ABI, signer);
        const contract = temp.attach(RESIDENT_ADDRESS);
        dispatch({
            type: 'info',
            title: 'Register resident',
            message: 'Uploading data to ipfs',
            position: 'topR'
        })
        let hash = await uploadJson({
            name: name,
            phone: phone,
            age: age,
        })
        console.log(hash);
        try{
            await contract.registerAsResident(hash);
            dispatch({
                type: 'success',
                message: 'Registration Successful',
                title: 'Registration success',
                position: 'topR'
            })
            window.location.reload();
        } catch(err) {
            dispatch({
                type: 'error',
                message: 'Something went wrong',
                title: 'Registration error',
                position: 'topR'
            })
        }
    }

    const registerAsOfficial = async () => {
        
        if(name.trim().legnth === 0 || phone.trim().length !== 10 || age.trim().length < 2){
            dispatch({
                type: 'error',
                title: 'Register error',
                message: 'Please provide correct details',
                position: 'topR'
            })
            return;
        }

        dispatch({
            type: 'info',
            title: 'Registering as official',
            message: 'Please wait',
            position: 'topR'
        })
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner()
        const temp = new ethers.Contract('dai.tokens.ethers.eth', GOVERNMENT_ABI, signer);
        const contract = temp.attach(GOVERNMENT_ADDRESS);
        dispatch({
            type: 'info',
            title: 'Registration Progress',
            message: 'Uploading data to ipfs',
            position: 'topR'
        })
        const hash = await uploadJson({
            name: name,
            phone: phone,
            age : age,
            department: department
        })
        try{
            dispatch({
                type: 'info',
                title: 'Registration progress',
                message: 'Registering as official',
                position: 'topR' 
            })
            await contract.registerAsOfficial(hash);
            dispatch({
                type: 'success',
                message: 'Registration Successful',
                title: 'Registration success',
                position: 'topR'
            })
            window.location.reload();
        } catch(err) {
            dispatch({
                type: 'error',
                message: 'Something went wrong',
                title: 'Registration error',
                position: 'topR'
            })
        }
    }

    return (
        <Box>
            <Modal isOpen={residentModal} onRequestClose={() => setResidentModal(false)} style={customStyles}>
                <Flex direction={'column'}>
                    <Input p='10' m='10' value={name} onChange={e => setName(e.target.value)} fontSize='20' type='text' placeholder='Enter your name'/><br/>
                    <Input p='10' m='10' fontSize='20' value={phone} onChange={e => setPhone(e.target.value)} type='tel' placeholder='Enter your phone'/><br/>
                    <Input p='10' m='10' fontSize='20' value={age} onChange={e => setAge(e.target.value)} type='number' placeholder='Enter your age'/><br/>
                    <Button p='10' m='10' onClick={registerAsResident}>Create Account</Button>
                </Flex>
            </Modal>
            <Modal isOpen={officialModal} onRequestClose={() => setOfficialModal(false)} style={customStyles}>
                <Flex direction={'column'}>
                    <Input p='10' m='10' value={name} onChange={e => setName(e.target.value)} fontSize='20' type='text' placeholder='Enter your name'/><br/>
                    <Input p='10' m='10' fontSize='20' value={phone} onChange={e => setPhone(e.target.value)} type='tel' placeholder='Enter your phone'/><br/>
                    <Input p='10' m='10' fontSize='20' value={age} onChange={e => setAge(e.target.value)} type='number' placeholder='Enter your age'/><br/>
                    <Select p='10' icon={''} fontSize='20' onChange={e => setDepartment(e.target.value)} value={department} placeholder='Select Your Department'>
                        <option value='Water Department'>Water Department</option>
                        <option value="Finance Department">Finance Department</option>
                        <option value="Transport Department">Transport Department</option>
                        <option value="Fire Department">Fire Department</option>
                    </Select>
                    <Button p='10' m='10' onClick={registerAsOfficial}>Create Account</Button>
                </Flex>
            </Modal>
            <Flex p='20' direction={'column'}  justify='space-evenly' minHeight={'300'} align={'center'}>
                <Image src={ImageOne} width={380} height={380}/>
                <Button onClick={() => setResidentModal(true)} fontSize='20' fontFamily={'Jetbrains Mono'} py='10' px='20' m='10' backgroundColor={'lightblue'} borderRadius={'50'} border={'none'} color={'111111'} cursor={'pointer'}>I'm a resident</Button>
                <Button onClick={() => setOfficialModal(true)} fontSize='20' fontFamily={'Jetbrains Mono'} py='10' px='30' m='10' backgroundColor={'lightblue'} borderRadius={'50'} border={'none'} color={'111111'} cursor={'pointer'}>I'm a government official</Button>
            </Flex>
        </Box>
    )
}

export default RegistrationForm;
