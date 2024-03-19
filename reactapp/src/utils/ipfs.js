import axios from 'axios';
import { PINATA_JWT } from '../constants'


const uploadJson = async (data) => {
    try{
        const response = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
            method: 'POST',
            headers: {Authorization: `Bearer ${PINATA_JWT}`, 'Content-Type': 'application/json'},
            body: `{"pinataContent":${JSON.stringify(data)}}`
        })
        console.log(`{"pinataContent":${JSON.stringify(data)}`)
        const resdata = await response.json();
        return resdata.IpfsHash;
    } catch(err){
        throw err;
    }
    };

export {
    uploadJson
}
