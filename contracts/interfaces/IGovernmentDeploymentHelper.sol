// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import {IStates} from "./IStates.sol";

interface IGovernmentDeploymentHelper is IStates {
    function deployGovernment(
        State _state,
        string memory _stateName,
        string memory _stateSymbol
    ) external returns (address);
}
