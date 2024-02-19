// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {ERC20Permit} from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/// @title Memecoin
/// @dev Extends ERC20 Token Standard basic implementation with permit functionality.
/// Adds an ownership layer for administrative actions.
contract Memecoin is ERC20, ERC20Permit, Ownable {
    /// @notice Thrown when an unauthorized address attempts a restricted operation
    error Unauthorized();

    /// @notice Emitted when the token pool address is updated
    /// @param tokenPool The new token pool address
    event TokenPoolUpdated(address tokenPool);

    /// @dev The address allowed to be spender through permit method
    address public tokenPool;

    /// @notice Mint the totalSupply, and transfer ownership to treasury just to have control over permit spender
    constructor(string memory name, string memory symbol, uint256 totalSupply_, address treasury)
        ERC20(name, symbol)
        ERC20Permit(name)
        Ownable(treasury)
    {
        _mint(treasury, totalSupply_);
    }

    /// @notice Executes an ERC20 permit request, allowing an approved spender to transfer owner's tokens
    /// @dev Spender is limited to only tokenPool to prevent Signature Phishing from attackers on token holders
    /// @dev Overrides the ERC20Permit's permit function to restrict spender to the token pool address
    /// @param owner The owner of the tokens
    /// @param spender The address attempting to become approved to spend tokens
    /// @param value The number of tokens spender is approved to spend
    /// @param deadline The timestamp until which the permit is valid
    /// @param v The recovery byte of the signature
    /// @param r Half of the ECDSA signature pair
    /// @param s Half of the ECDSA signature pair
    function permit(address owner, address spender, uint256 value, uint256 deadline, uint8 v, bytes32 r, bytes32 s)
        public
        virtual
        override(ERC20Permit)
    {
        if (spender != tokenPool) revert Unauthorized();
        super.permit(owner, spender, value, deadline, v, r, s);
    }

    /// @notice Sets a new token pool address with the permission to spend tokens via permit
    /// @dev Can only be called by the current owner of the contract
    /// @param _tokenPool The new token pool address
    function setTokenPool(address _tokenPool) external onlyOwner {
        tokenPool = _tokenPool;
        emit TokenPoolUpdated(_tokenPool);
    }
}
