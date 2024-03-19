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
                return null;
            }
            return accounts[0];
        } catch (err) {
            console.error(err)
        }
    }
}

export default checkWalletIsConnected;
