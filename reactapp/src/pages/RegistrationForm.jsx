import { Button, Box, Flex } from '@chakra-ui/react'
import { RESIDENT_ABI, RESIDENT_ADDRESS, GOVERNMENT_ABI, GOVERNMENT_ADDRESS } from '../constants'
import { useNotification } from '@web3uikit/core'
import { ethers } from 'ethers';

const RegistrationForm = () => {
    const dispatch = useNotification();

    const registerAsResident = async () => {
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
        try{
            await contract.registerAsResident('');
            dispatch({
                type: 'success',
                message: 'Registration Successful',
                title: 'Registration success'
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
        try{
            await contract.registerAsOfficial('');
            dispatch({
                type: 'success',
                message: 'Registration Successful',
                title: 'Registration success'
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
            <Flex p='20' direction={'column'}  justify='space-evenly' minHeight={'300'} align={'center'}>
                <Button onClick={registerAsResident} fontSize='30' p='20' m='10' backgroundColor={'#051C2C'} color={'white'} cursor={'pointer'}>I'm a resident</Button>
                <Button onClick={registerAsOfficial} fontSize='30' p='20' m='10' backgroundColor={'#051C2C'} color={'white'} cursor={'pointer'}>I'm a government official</Button>
            </Flex>
        </Box>
    )
}

export default RegistrationForm;
