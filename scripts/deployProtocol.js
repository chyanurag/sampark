const { ethers, network } = require("hardhat");
const verify = require("../utils/verify");

async function deployAndLog(contractName, constructorArgs, signer, isDevelopmentChainId, BLOCK_CONFIRMATIONS) {
    const contract = await ethers.deployContract(contractName, constructorArgs, signer);
    console.log(`Deploying \`${contractName}\` contract`);
    await contract.waitForDeployment();
    await contract.deploymentTransaction().wait(isDevelopmentChainId ? 0 : BLOCK_CONFIRMATIONS);
    console.log(`\`${contractName}\` contract deployed at ${await contract.getAddress()}`);

    return contract;
}

async function deployProtocol() {
    let statefactory, residentDeploymentHelper, governmentDeploymentHelper, proposalDeploymentHelper;
    const BLOCK_CONFIRMATIONS = 3;
    const [signer] = await ethers.getSigners();
    const isDevelopmentChainId = network.config.chainId === 31337 ? true : false;

    residentDeploymentHelper = await deployAndLog(
        "ResidentDeploymentHelper",
        [],
        signer,
        isDevelopmentChainId,
        BLOCK_CONFIRMATIONS,
    );

    governmentDeploymentHelper = await deployAndLog(
        "GovernmentDeploymentHelper",
        [],
        signer,
        isDevelopmentChainId,
        BLOCK_CONFIRMATIONS,
    );

    proposalDeploymentHelper = await deployAndLog(
        "ProposalDeploymentHelper",
        [],
        signer,
        isDevelopmentChainId,
        BLOCK_CONFIRMATIONS,
    );

    statefactory = await deployAndLog(
        "StateFactory",
        [
            await residentDeploymentHelper.getAddress(),
            await governmentDeploymentHelper.getAddress(),
            await proposalDeploymentHelper.getAddress(),
        ],
        signer,
        isDevelopmentChainId,
        BLOCK_CONFIRMATIONS,
    );

    if (!isDevelopmentChainId && process.env.ETHERSCAN_API_KEY) {
        await verify(await residentDeploymentHelper.getAddress(), []);
        await verify(await governmentDeploymentHelper.getAddress(), []);
        await verify(await proposalDeploymentHelper.getAddress(), []);
        await verify(await statefactory.getAddress(), [
            await residentDeploymentHelper.getAddress(),
            await governmentDeploymentHelper.getAddress(),
            await proposalDeploymentHelper.getAddress(),
        ]);
    }

    return {
        residentDeploymentHelper,
        governmentDeploymentHelper,
        proposalDeploymentHelper,
        statefactory,
    };
}

module.exports = deployProtocol;
