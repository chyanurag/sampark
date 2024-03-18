const { ethers, network } = require("hardhat");

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
    const BLOCK_CONFIRMATIONS = 6;
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
        signer,
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

    return {
        residentDeploymentHelper,
        governmentDeploymentHelper,
        proposalDeploymentHelper,
        statefactory,
    };
}

module.exports = deployProtocol;
