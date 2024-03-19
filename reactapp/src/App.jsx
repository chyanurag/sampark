import { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { Box, Text, Flex, Button, Center } from '@chakra-ui/react'
import { gql, useQuery } from '@apollo/client'
import UserResident from './pages/UserResident'
import UserOfficial from './pages/UserOfficial'
import Header from './components/Header'
import PuffLoader from 'react-spinners/PuffLoader'
import RegistrationForm from './pages/RegistrationForm'

const CheckIfUser = ({ address }) => {
    const queryUserExists = gql`
        {
            newRegistrations{
                address
                official
            }
        }
    `
    const { loading, data, error } = useQuery(queryUserExists)

    const checkOfficialOrResident = () => {
        let registrations = data['newRegistrations'];
        for(let reg of registrations){
            if(reg.address == address){
                if(reg.official){
                    return <UserOfficial address={address}/>
                } else {
                    return <UserResident address={address}/>
                }
            }
        }
        return <RegistrationForm address={address}/>
    }

    return(
        <>
            {loading ? <Center my='50'><PuffLoader size={200}/></Center> : checkOfficialOrResident()}
        </>
    )
}


function App() {
    const [address, setAddress] = useState(null);
    const provider = new ethers.BrowserProvider(window.ethereum);

    useEffect(() => {
        window.ethereum.on('accountsChanged', async () => {
            window.location.reload();
        })
    })

    const checkWalletIsConnected = async () => { 
        const { ethereum } = window;
        if(!ethereum){
            alert('Metamask is not installed');
            return;
        } else {
            try{
                const accounts = await ethereum.request({ method: "eth_requestAccounts" })
                if(accounts.length === 0){
                    alert('You dont\'t have any metamask accounts');
                    return;
                }
                const account = accounts[0];
                setAddress(account);
            } catch (err) {
                console.error(err)
            }
        }
    }

    const connectWalletHandler = async () => {
        const { ethereum } = window;
        if(!ethereum){
            alert('Metamask is not installed');
            return;
        }
        try{
            const accounts = await ethereum.request({ method: "eth_requestAccounts" })
            if(accounts.length === 0){
                alert('You dont\'t have any metamask accounts');
                return;
            }
            const account = accounts[0];
            setAddress(account);
        } catch (err) {
            console.error(err)
        }
    }

    useEffect(() => {
        checkWalletIsConnected();
    }, [])

    return (
        <Box>
            <Header />
            {address ? <CheckIfUser address={address}/> : <button onClick={connectWalletHandler}>Connect Metamask</button>}
        </Box>
    )
}

export default App;
