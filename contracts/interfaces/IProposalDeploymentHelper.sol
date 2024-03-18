// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import {IStates} from "./IStates.sol";

interface IProposalDeploymentHelper is IStates {
    function deployProposal(State _state) external returns (address);
}
