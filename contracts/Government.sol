// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import {IStates} from "./interfaces/IStates.sol";
import {ERC721URIStorage, ERC721} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {Resident} from "./Resident.sol";
import {Utility} from "./abstract/Utility.sol";

contract Government is IStates, Utility, ERC721URIStorage, Ownable {
    State private immutable i_state;

    bool private s_isResidentContractSet;
    Resident private s_residentContract;

    uint256 private s_nextTokenId;
    mapping(address official => bool isVerified) private s_isVerified;

    event ResidentContractSet(address indexed residentContract);
    event NewRegistration(address indexed official, uint256 indexed tokenId);
    event OfficialVerified(address indexed official, uint256 indexed tokenId);

    error OfficialNotVerified(address official);
    error NotOwnerOfTokenId(address resident, uint256 tokenId);
    error ResidentContractAlreadySet(address residentContract);
    error AlreadyRegistered();

    modifier onlyVerifiedOfficial() {
        if (!s_isVerified[msg.sender]) revert OfficialNotVerified(msg.sender);
        _;
    }

    constructor(
        State _state,
        string memory _stateName,
        string memory _stateSymbol
    ) ERC721(_stateName, _stateSymbol) Ownable(tx.origin) {
        s_isResidentContractSet = false;
        i_state = _state;
        s_nextTokenId = 0;
    }

    function setResidentContract(address _residentContract) external onlyOwner {
        if (s_isResidentContractSet) revert ResidentContractAlreadySet(address(s_residentContract));
        s_residentContract = Resident(_residentContract);
        s_isResidentContractSet = true;

        emit ResidentContractSet(_residentContract);
    }

    function registerAsOfficial(string memory _officialDataUri) external {
        if (balanceOf(msg.sender) > 0) revert AlreadyRegistered();
        uint256 tokenId = ++s_nextTokenId;
        _mint(msg.sender, tokenId);
        _setTokenURI(tokenId, _officialDataUri);

        emit NewRegistration(msg.sender, tokenId);
    }

    function verifyOfficial(
        address _official,
        uint256 _tokenId
    ) external onlyOwner notZeroAddress(_official) notZeroTokenId(_tokenId) {
        if (ownerOf(_tokenId) != _official) revert NotOwnerOfTokenId(_official, _tokenId);
        s_isVerified[_official] = true;

        emit OfficialVerified(_official, _tokenId);
    }

    function getState() external view returns (State) {
        return i_state;
    }

    function getResidentContract() external view returns (Resident) {
        return s_residentContract;
    }

    function getNextTokenId() external view returns (uint256) {
        return s_nextTokenId + 1;
    }

    function isVerifiedOfficial(address _official) external view returns (bool) {
        return s_isVerified[_official];
    }
}
