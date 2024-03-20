import { Box, Flex, Text, Spacer } from '@chakra-ui/react'
import { Link } from 'react-router-dom'

const Header = () => {
    return (
        <Box p='20' backgroundColor={'#111111'} color={'rgb(0 188 225)'}>
            <Flex align={'center'}>
                <Text fontSize='24' fontFamily={'Jetbrains Mono, monosopce'} color={'#ff0000'}><Link to='/' style={{textDecoration: 'none', color: 'lightblue'}}>Sampark</Link></Text>
                <Spacer />
                <Text fontSize={'18'}>Maharashtra (MH)</Text>
            </Flex>
        </Box>
    )
}

export default Header;