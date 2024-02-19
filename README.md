# Memecoin Smart Contract

## Overview

Memecoin ERC-20 token incorporates ERC-20 Permit (EIP-2612) for gasless transactions, extending the basic functionalities of a standard ERC-20 token to enhance user experience in the decentralized finance (DeFi) ecosystem. It introduces a unique permission model that restricts the use of `permit` function to a designated address, referred to as the token pool, to mitigate risks associated with signature phishing attacks.

## Key Features

- **ERC-20 Compliance**: Ensures compatibility with the vast ecosystem of Ethereum-based applications.
- **ERC-20 Permit (EIP-2612)**: Allows gasless transactions by leveraging signatures for approvals, enhancing user experience.
- **Restricted Permit Usage**: Enhances security by limiting `permit` functionality to a predefined address, thereby protecting token holders from potential signature phishing.

## Prerequisites

Before deploying or interacting with the Memecoin smart contract, ensure you have the following installed:

- [Node.js](https://nodejs.org/) (v18.x or later recommended)
- [npm](https://www.npmjs.com/) (v9.x or later)
- [Hardhat](https://hardhat.org/) for smart contract compilation and deployment
- [MetaMask](https://metamask.io/) or any Ethereum-compatible wallet for interaction

## 📝 Contracts

```bash
Contracts
├─ Memecoin.sol
```

## Installation

To set up the Memecoin project locally for development:

```bash
git clone https://github.com/yourusername/memecoin.git
cd memecoin
npm install
```

## Running Tests

```bash
npx hardhat test
```

## Running Test Coverage

```bash
npx hardhat coverage
```

## ⚖️ License

All files in `/contracts` are licensed under MIT as indicated in their SPDX header.
