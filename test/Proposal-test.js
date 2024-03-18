const { ethers } = require("hardhat");
const { expect } = require("chai");

describe("Proposal", function () {
    let Proposal;
    let proposal;
    let owner;
    let resident;
    let government;

    before(async function () {
        [owner, resident, government] = await ethers.getSigners();

        // Deploy the Proposal contract
        Proposal = await ethers.getContractFactory("Proposal");
        const state = 1;
        proposal = await Proposal.deploy(state);

        await proposal.setResidentContract(resident.address);

        await proposal.setGovernmentContract(government.address);
    });

    it("Should return the state", async function () {
        const state = await proposal.getState();

        expect(state).to.equal(1);
    });

    it("Should return the Resident contract address", async function () {
        const residentContract = await proposal.getResidentContract();

        expect(residentContract).to.equal(resident.address);
    });

    it("Should return the Government contract address", async function () {
        const governmentContract = await proposal.getGovernmentContract();

        expect(governmentContract).to.equal(government.address);
    });

    // it("Should return a proposal", async function () {

    //     await proposal.createProposal("https://example.com/proposal/123");

    //     const proposalCount = await proposal.getProposalCount();

    //     const proposalDetails = await proposal.getProposal(proposalCount - 1);

    //
    //
    //     expect(proposalDetails).to.exist;
    //     expect(proposalDetails.resident).to.exist;
    //     expect(proposalDetails.votes).to.exist;
    //     expect(proposalDetails.isResolved).to.exist;
    //     expect(proposalDetails.detailsUri).to.exist;
    // });

    // it("Should allow a verified resident to vote for a proposal", async function () {
    //
    //     await proposal.connect(resident).voteForProposal(0);

    //
    //     const proposalDetails = await proposal.getProposal(0);
    //     expect(proposalDetails.votes).to.equal(1);
    // });
});
