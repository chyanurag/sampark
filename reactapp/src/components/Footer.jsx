import { Box, Flex, Center, Text, Spacer } from '@chakra-ui/react'

const Footer = () => {
    return (
        <Center>
        <Box p='20' mt='20' style={{position: 'absolute', bottom: '0px'}}>
            <Text color={'grey'}>Sampark - BlockLance</Text>
        </Box>
        </Center>
    )
}

export default Footer;
