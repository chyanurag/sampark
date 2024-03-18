// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import {IStates} from "../interfaces/IStates.sol";
import {Government} from "../Government.sol";

contract GovernmentDeploymentHelper is IStates {
    function deployGovernment(
        State _state,
        string memory _stateName,
        string memory _stateSymbol
    ) external returns (address) {
        Government newGovernmentContract = new Government(_state, _stateName, _stateSymbol);

        return address(newGovernmentContract);
    }
}
