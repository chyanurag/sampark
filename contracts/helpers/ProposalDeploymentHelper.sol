// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import {IStates} from "../interfaces/IStates.sol";
import {Proposal} from "../Proposal.sol";

contract ProposalDeploymentHelper is IStates {
    function deployProposal(State _state) external returns (address) {
        Proposal newProposalContract = new Proposal(_state);

        return address(newProposalContract);
    }
}
