// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import {IStates} from "./interfaces/IStates.sol";
import {Government} from "./Government.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {Resident} from "./Resident.sol";

contract Proposal is IStates, Ownable {
    struct ProposalDetails {
        address resident;
        uint256 votes;
        bool isResolved;
        string detailsUri;
    }

    State private immutable i_state;

    Resident private s_residentContract;
    Government private s_governmentContract;
    uint256 private s_areResidentAndGovernmentContractSet;

    uint256 private s_proposalCount;
    ProposalDetails[] private s_proposals;
    mapping(uint256 index => mapping(address resident => bool agrees)) private s_residentSupportsProposal;

    event ResidentContractSet(address indexed residentContract);
    event GovernmentContractSet(address indexed governmentContract);
    event ProposalCreated(address indexed resident, uint256 indexed index);
    event VotedForProposal(address indexed resident, uint256 indexed index);
    event RevokedVotedForProposal(address indexed resident, uint256 indexed index);
    event ProposalUpdatedByOfficial(address indexed official, uint256 indexed index, string newProposalDataUri);
    event ProposalResolved(address indexed official, uint256 index);

    error ALreadySet();
    error NotVerifiedResident(address resident);
    error AlreadyVoted(uint256 index, address resident);
    error IndexOutOfBounds(uint256 index);
    error NotAlreadyVoted(uint256 index, address resident);
    error NotVerifiedOfficial(address official);

    constructor(State _state) Ownable(tx.origin) {
        i_state = _state;
        s_areResidentAndGovernmentContractSet = 2;
        s_proposalCount = 0;
    }

    modifier onlyVerifiedResident() {
        if (!s_residentContract.isVerifiedResident(msg.sender)) revert NotVerifiedResident(msg.sender);
        _;
    }

    modifier onylVerifiedOfficial() {
        if (!s_governmentContract.isVerifiedOfficial(msg.sender)) revert NotVerifiedOfficial(msg.sender);
        _;
    }

    modifier onlyValidIndex(uint256 _index) {
        if (_index >= s_proposals.length) revert IndexOutOfBounds(_index);
        _;
    }

    function setResidentContract(address _residentContract) external onlyOwner {
        if (s_areResidentAndGovernmentContractSet == 0) revert ALreadySet();
        s_residentContract = Resident(_residentContract);
        --s_areResidentAndGovernmentContractSet;

        emit ResidentContractSet(_residentContract);
    }

    function setGovernmentContract(address _governmentContract) external onlyOwner {
        if (s_areResidentAndGovernmentContractSet == 0) revert ALreadySet();
        s_governmentContract = Government(_governmentContract);
        --s_areResidentAndGovernmentContractSet;

        emit GovernmentContractSet(_governmentContract);
    }

    function createProposal(string memory _proposalUri) external onlyVerifiedResident {
        ++s_proposalCount;
        ProposalDetails memory newProposal = ProposalDetails({
            resident: msg.sender,
            votes: 0,
            isResolved: false,
            detailsUri: _proposalUri
        });
        s_proposals.push(newProposal);

        emit ProposalCreated(msg.sender, s_proposalCount - 1);
    }

    function voteForProposal(uint256 _index) external onlyVerifiedResident onlyValidIndex(_index) {
        if (s_residentSupportsProposal[_index][msg.sender]) revert AlreadyVoted(_index, msg.sender);
        s_proposals[_index].votes = ++s_proposals[_index].votes;
        s_residentSupportsProposal[_index][msg.sender] = true;

        emit VotedForProposal(msg.sender, _index);
    }

    function revokeVoteForProposal(uint256 _index) external onlyVerifiedResident onlyValidIndex(_index) {
        if (!s_residentSupportsProposal[_index][msg.sender]) revert NotAlreadyVoted(_index, msg.sender);
        s_proposals[_index].votes = --s_proposals[_index].votes;
        s_residentSupportsProposal[_index][msg.sender] = false;

        emit RevokedVotedForProposal(msg.sender, _index);
    }

    function updateProposal(
        uint256 _index,
        string memory _newProposalDataUri
    ) external onylVerifiedOfficial onlyValidIndex(_index) {
        s_proposals[_index].detailsUri = _newProposalDataUri;

        emit ProposalUpdatedByOfficial(msg.sender, _index, _newProposalDataUri);
    }

    function markProposalAsResolved(uint256 _index) external onylVerifiedOfficial onlyValidIndex(_index) {
        s_proposals[_index].isResolved = true;

        emit ProposalResolved(msg.sender, _index);
    }

    function getState() external view returns (State) {
        return i_state;
    }

    function getResidentContract() external view returns (Resident) {
        return s_residentContract;
    }

    function getGovernmentContract() external view returns (Government) {
        return s_governmentContract;
    }

    function getProposalCount() external view returns (uint256) {
        return s_proposalCount;
    }

    function getProposal(uint256 _index) external view onlyValidIndex(_index) returns (ProposalDetails memory) {
        return s_proposals[_index];
    }
}
