// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import {IStates} from "../interfaces/IStates.sol";
import {Resident} from "../Resident.sol";

contract ResidentDeploymentHelper is IStates {
    function deployResident(
        State _state,
        string memory _stateName,
        string memory _stateSymbol
    ) external returns (address) {
        Resident newResidentContract = new Resident(_state, _stateName, _stateSymbol);

        return address(newResidentContract);
    }
}
