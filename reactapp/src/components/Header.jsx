import { Box, Flex, Text, Spacer } from '@chakra-ui/react'
import { Link } from 'react-router-dom'

const Header = () => {
    return (
        <Box p='30' backgroundColor={'#201547'} color={'rgb(0 188 225)'}>
            <Flex>
                <Text fontSize='40' fontFamily={'Jetbrains Mono, monosopce'}><Link to='/' style={{textDecoration: 'none'}}>Sampark</Link></Text>
                <Spacer />
                <Text></Text>
            </Flex>
        </Box>
    )
}

export default Header;
