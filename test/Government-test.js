const { ethers } = require("hardhat");
const { expect } = require("chai");

describe("Government", function () {
    let Government;
    let government;
    let owner;

    before(async function () {
        [owner] = await ethers.getSigners();

        // Deploy the Government contract
        Government = await ethers.getContractFactory("Government");
        const state = 1;
        const stateName = "TestState";
        const stateSymbol = "TS";
        government = await Government.deploy(state, stateName, stateSymbol);
    });

    it("Should return the state", async function () {
        const state = await government.getState();

        expect(state).to.equal(1);
    });

    it("Should return the Resident contract address", async function () {
        const residentContractAddress = await government.getResidentContract();

        expect(ethers.isAddress(residentContractAddress)).to.be.true;
    });

    it("Should return the next token ID", async function () {
        const nextTokenId = await government.getNextTokenId();

        expect(nextTokenId).to.not.be.undefined;

        expect(nextTokenId).to.be.greaterThan(0);
    });

    it("Should return whether an official is verified", async function () {
        const officialAddress = "0xb1a5C42D0bD999EF41d3a489023bB98EfEB02f3a";

        const isVerified = await government.isVerifiedOfficial(officialAddress);

        expect(isVerified).to.be.a("boolean");
    });
});
