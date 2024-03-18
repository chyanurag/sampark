// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import {AStates} from "../abstract/AStates.sol";
import {Government} from "../Government.sol";
import {Proposal} from "../Proposal.sol";
import {Resident} from "../Resident.sol";

contract StateFactory is AStates {
    mapping(State state => address residentContract) private s_stateToResident;
    mapping(State state => address governmentContract) private s_stateToGovernment;
    mapping(State state => address proposalContract) private s_stateToProposal;

    event ResidentGovernmentAndProposalDeployedForState(
        State indexed state,
        address indexed residentContract,
        address indexed governmentContract,
        address proposalContract
    );

    error ResidentAndGovernmentContractsAlreadyDeployed(address residentContract, address governmentContract);

    function deployResidentAndGovernmentForState(
        State _state,
        string memory _stateName,
        string memory _stateSymbol
    ) external {
        address residentContract = s_stateToResident[_state];
        address governmentContract = s_stateToGovernment[_state];

        if (residentContract != address(0) || governmentContract != address(0))
            revert ResidentAndGovernmentContractsAlreadyDeployed(residentContract, governmentContract);
        else {
            Government newGovernmentContract = new Government(_state, _stateName, _stateSymbol);
            Resident newResidentContract = new Resident(_state, _stateName, _stateSymbol);
            Proposal newProposalContract = new Proposal(_state);

            newGovernmentContract.setResidentContract(address(newResidentContract));
            newResidentContract.setGovernmentContract(address(newGovernmentContract));

            s_stateToResident[_state] = address(newResidentContract);
            s_stateToGovernment[_state] = address(newGovernmentContract);
            s_stateToProposal[_state] = address(newProposalContract);

            emit ResidentGovernmentAndProposalDeployedForState(
                _state,
                address(newResidentContract),
                address(newGovernmentContract),
                address(newProposalContract)
            );
        }
    }

    function getGovernmentFromState(State _state) external view returns (address) {
        return s_stateToGovernment[_state];
    }

    function getResidentFromState(State _state) external view returns (address) {
        return s_stateToResident[_state];
    }

    function getProposalFromState(State _state) external view returns (address) {
        return s_stateToProposal[_state];
    }
}
