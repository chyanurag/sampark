const { expect } = require("chai");

describe("ResidentDeploymentHelper", function () {
    it("Should deploy a new Resident contract", async function () {
        const ResidentDeploymentHelper = await ethers.getContractFactory("ResidentDeploymentHelper");
        const residentDeploymentHelper = await ResidentDeploymentHelper.deploy();
        await residentDeploymentHelper.waitForDeployment();

        const state = 1; // Replace with desired state value
        const stateName = "ExampleState";
        const stateSymbol = "ES";

        const tx = await residentDeploymentHelper.deployResident(state, stateName, stateSymbol);
        await tx.wait();

        // Check if the deployed contract exists
        const contractExists = await checkContractExists(residentDeploymentHelper);
        expect(contractExists).to.be.true;
    });
});

async function checkContractExists(contract) {
    try {
        // Replace with any function call of the deployed contract
        await contract.deployResident(0, "", "");
        return true;
    } catch (error) {
        return false;
    }
}
