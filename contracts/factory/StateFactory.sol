// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import {IStates} from "../interfaces/IStates.sol";
import {IResidentDeploymentHelper} from "../interfaces/IResidentDeploymentHelper.sol";
import {IGovernmentDeploymentHelper} from "../interfaces/IGovernmentDeploymentHelper.sol";
import {IProposalDeploymentHelper} from "../interfaces/IProposalDeploymentHelper.sol";

contract StateFactory is IStates {
    address private immutable i_residentDeploymentHelper;
    address private immutable i_governmentDeploymentHelper;
    address private immutable i_proposalDeploymentHelper;

    mapping(State state => address residentContract) private s_stateToResident;
    mapping(State state => address governmentContract) private s_stateToGovernment;
    mapping(State state => address proposalContract) private s_stateToProposal;

    event StateSetUp(
        State indexed state,
        address indexed residentContract,
        address indexed governmentContract,
        address proposalContract
    );

    error StateAlreadySetUp(address residentContract, address governmentContract, address proposalContract);

    constructor(
        address _residentDeploymentHelper,
        address _governmentDeploymentHelper,
        address _proposalDeploymentHelper
    ) {
        i_residentDeploymentHelper = _residentDeploymentHelper;
        i_governmentDeploymentHelper = _governmentDeploymentHelper;
        i_proposalDeploymentHelper = _proposalDeploymentHelper;
    }

    function deployResidentGovernmentAndProposalForState(
        State _state,
        string memory _stateName,
        string memory _stateSymbol
    ) external returns (address, address, address) {
        address residentContract = s_stateToResident[_state];
        address governmentContract = s_stateToGovernment[_state];
        address proposalContract = s_stateToProposal[_state];

        if (residentContract != address(0) || governmentContract != address(0) || proposalContract != address(0))
            revert StateAlreadySetUp(residentContract, governmentContract, proposalContract);
        else {
            address newResidentContract = IResidentDeploymentHelper(i_residentDeploymentHelper).deployResident(
                _state,
                _stateName,
                _stateSymbol
            );
            address newGovernmentContract = IGovernmentDeploymentHelper(i_governmentDeploymentHelper).deployGovernment(
                _state,
                _stateName,
                _stateSymbol
            );
            address newProposalContract = IProposalDeploymentHelper(i_proposalDeploymentHelper).deployProposal(_state);

            s_stateToResident[_state] = newResidentContract;
            s_stateToGovernment[_state] = newGovernmentContract;
            s_stateToProposal[_state] = newProposalContract;

            emit StateSetUp(_state, newResidentContract, newGovernmentContract, newProposalContract);

            return (newResidentContract, newGovernmentContract, newProposalContract);
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
