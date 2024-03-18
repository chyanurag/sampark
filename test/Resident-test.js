const { ethers } = require("hardhat");
const { expect } = require("chai");

describe("Resident", function () {
    let Resident;
    let resident;
    let owner;

    before(async function () {
        [owner] = await ethers.getSigners();

        // Deploy the Resident contract
        Resident = await ethers.getContractFactory("Resident");
        const state = 1;
        const stateName = "TestState";
        const stateSymbol = "TS";
        resident = await Resident.deploy(state, stateName, stateSymbol);
    });

    it("Should return the state", async function () {
        
        const state = await resident.getState();

      
        expect(state).to.equal(1);
    });

    it("Should return the Government contract address", async function () {
       
        const governmentContractAddress = await resident.getGovernmentContract();

     
        expect(governmentContractAddress).to.not.be.undefined;

        
        expect(ethers.isAddress(governmentContractAddress)).to.be.true;
    });

    it("Should return the next token ID", async function () {
        const nextTokenId = await resident.getNextTokenId();

        expect(nextTokenId).to.not.be.undefined;

        expect(nextTokenId).to.be.greaterThan(0);
    });

    it("Should return whether a resident is verified", async function () {
       
        const residentAddress = "0xb1a5C42D0bD999EF41d3a489023bB98EfEB02f3a";

       
        const isVerified = await resident.isVerifiedResident(residentAddress);

        expect(isVerified).to.be.a("boolean");
    });
});
