// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

abstract contract Utility {
    error TokenIdZero();
    error ZeroAddress();

    modifier notZeroTokenId(uint256 _value) {
        if (_value == 0) revert TokenIdZero();
        _;
    }

    modifier notZeroAddress(address _address) {
        if (_address == address(0)) revert ZeroAddress();
        _;
    }
}
