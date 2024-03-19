const { expect } = require("chai");

describe("GovernmentDeploymentHelper", function () {
    it("Should deploy a new Government contract", async function () {
        const GovernmentDeploymentHelper = await ethers.getContractFactory("GovernmentDeploymentHelper");
        const governmentDeploymentHelper = await GovernmentDeploymentHelper.deploy();
        await governmentDeploymentHelper.waitForDeployment();

        const state = 1;
        const stateName = "ExampleState";
        const stateSymbol = "ES";

        const tx = await governmentDeploymentHelper.deployGovernment(state, stateName, stateSymbol);
        await tx.wait();

        const contractExists = await checkContractExists(governmentDeploymentHelper);
        expect(contractExists).to.be.true;
    });
});

async function checkContractExists(contract) {
    try {
        await contract.deployGovernment(0, "", "");
        return true;
    } catch (error) {
        return false;
    }
}
