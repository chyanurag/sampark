const { expect } = require("chai");

describe("ProposalDeploymentHelper", function () {
    it("Should deploy a new Proposal contract", async function () {
        const ProposalDeploymentHelper = await ethers.getContractFactory("ProposalDeploymentHelper");
        const proposalDeploymentHelper = await ProposalDeploymentHelper.deploy();
        await proposalDeploymentHelper.waitForDeployment();

        const state = 1; // Replace with desired state value

        const tx = await proposalDeploymentHelper.deployProposal(state);
        await tx.wait();

        // Check if the deployed contract exists
        const contractExists = await checkContractExists(proposalDeploymentHelper);
        expect(contractExists).to.be.true;
    });
});

async function checkContractExists(contract) {
    try {
        // Replace with any function call of the deployed contract
        await contract.deployProposal(0);
        return true;
    } catch (error) {
        return false;
    }
}
