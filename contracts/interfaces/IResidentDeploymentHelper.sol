// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import {IStates} from "./IStates.sol";

interface IResidentDeploymentHelper is IStates {
    function deployResident(
        State _state,
        string memory _stateName,
        string memory _stateSymbol
    ) external returns (address);
}
