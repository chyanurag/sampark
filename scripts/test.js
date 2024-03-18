const { ethers } = require("hardhat");

async function main(){
    
    const factory = await ethers.getContractFactory("Proposal");
    const contract = await factory.attach('0x4A540bC90f13928044ebBA3b97A46C330f779edC');
    
    let count = await contract.getState();
    console.log(`Count : ${count}`);


}

main()
.then(() => process.exit(0))
.catch(err => console.erorr(err))
