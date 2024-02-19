import {
  time,
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import { ethers } from "hardhat";
import { EIP712Domain } from "../helpers/EIP712.types";

describe("Memecoin", function () {
  async function deployTokenFixture() {
    const [deployer, treasury, tokenPool, otherAccount] =
      await ethers.getSigners();

    const totalSupply = ethers.parseEther("1000000"); // 1 million tokens for simplicity
    const Memecoin = await ethers.getContractFactory("Memecoin");
    const memecoin = await Memecoin.deploy(
      "Memecoin",
      "MMC",
      totalSupply,
      treasury.address,
    );

    return {
      memecoin,
      deployer,
      treasury,
      tokenPool,
      otherAccount,
      totalSupply,
    };
  }

  describe("Deployment", function () {
    it("Should assign the total supply of tokens to the treasury", async function () {
      const { memecoin, treasury, totalSupply } =
        await loadFixture(deployTokenFixture);

      expect(await memecoin.balanceOf(treasury.address)).to.equal(totalSupply);
    });

    it("Should set the right owner", async function () {
      const { memecoin, treasury } = await loadFixture(deployTokenFixture);

      expect(await memecoin.owner()).to.equal(treasury.address);
    });
  });

  describe("setTokenPool", function () {
    it("Should correctly set the token pool address", async function () {
      const { memecoin, tokenPool, treasury } =
        await loadFixture(deployTokenFixture);

      // Only the owner should be able to set the token pool address
      await expect(memecoin.connect(treasury).setTokenPool(tokenPool.address))
        .to.emit(memecoin, "TokenPoolUpdated")
        .withArgs(tokenPool.address);

      expect(await memecoin.tokenPool()).to.equal(tokenPool.address);
    });

    it("Should revert if a non-owner tries to set the token pool address", async function () {
      const { memecoin, tokenPool, otherAccount } =
        await loadFixture(deployTokenFixture);

      // revert OwnableUnauthorizedAccount(_msgSender())
      await expect(
        memecoin.connect(otherAccount).setTokenPool(tokenPool.address),
      ).to.be.reverted;
    });
  });
});

describe("Permit", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function deployFixture() {
    const ONE_HOUR = 1 * 60 * 60;
    const totalSupply = ethers.parseEther("1000000"); // 1 million tokens for simplicity

    // domain: EIP712Domain, types: EIP712TypeDefinition, values: Object, signer: HardhatSignerType

    // Contracts are deployed using the first signer/account by default
    const [owner, otherAccount, stranger] = await ethers.getSigners();

    const TokenFactory = await ethers.getContractFactory("Memecoin");
    const token = await TokenFactory.deploy(
      "Memecoin",
      "MMC",
      totalSupply,
      owner.address,
    );

    const network = await ethers.provider.getNetwork();

    const blockNumBefore = await ethers.provider.getBlockNumber();
    const blockBefore = await ethers.provider.getBlock(blockNumBefore);
    const timestampBefore = blockBefore?.timestamp;

    let deadline = 0;
    if (timestampBefore) {
      deadline = timestampBefore + ONE_HOUR;
    }

    const EIP712DomainDefinition = [
      { name: "name", type: "string" },
      { name: "version", type: "string" },
      { name: "chainId", type: "uint256" },
      { name: "verifyingContract", type: "address" },
    ];

    const PermitDefinition = [
      { name: "owner", type: "address" },
      { name: "spender", type: "address" },
      { name: "value", type: "uint256" },
      { name: "nonce", type: "uint256" },
      { name: "deadline", type: "uint256" },
    ];

    const tokenDomainData: EIP712Domain = {
      name: await token.name(),
      version: "1",
      verifyingContract: await token.getAddress(),
      chainId: Number(network.chainId),
    };

    const message = {
      owner: await owner.getAddress(),
      spender: await otherAccount.getAddress(),
      value: totalSupply,
      nonce: await token.nonces(await owner.getAddress()),
      deadline: deadline,
    };

    const typedData = {
      types: {
        // EIP712Domain: EIP712DomainDefinition,
        Permit: PermitDefinition,
      },
      domain: tokenDomainData,
      primaryType: "Permit",
      message: message,
    };

    const signature = await owner.signTypedData(
      typedData.domain,
      typedData.types,
      typedData.message,
    );

    const verifiedAddress = ethers.verifyTypedData(
      typedData.domain,
      typedData.types,
      typedData.message,
      signature,
    );

    console.log(
      { signature, verifiedAddress },
      verifiedAddress === (await owner.getAddress()),
    );

    // Split the signature into v, r, and s values
    const r = signature.slice(0, 66);
    const s = "0x" + signature.slice(66, 130);
    const v = "0x" + signature.slice(130, 132);

    return {
      token,
      owner,
      otherAccount,
      stranger,
      totalSupply,
      message,
      signature,
      r,
      s,
      v,
    };
  }

  describe("Deployment", function () {
    it("Should pass the permit and transfer from methods", async function () {
      const { owner, token, otherAccount, totalSupply, message, r, s, v } =
        await loadFixture(deployFixture);

      expect(await token.balanceOf(await owner.getAddress())).to.equal(
        totalSupply,
      );

      await token.connect(owner).setTokenPool(await otherAccount.getAddress());

      await token
        .connect(otherAccount)
        .permit(
          await owner.getAddress(),
          await otherAccount.getAddress(),
          message.value,
          message.deadline,
          v,
          r,
          s,
        );

      await token
        .connect(otherAccount)
        .transferFrom(
          await owner.getAddress(),
          await otherAccount.getAddress(),
          totalSupply,
        );

      expect(await token.balanceOf(await owner.getAddress())).to.equal(0);
    });

    it("Should revert for invalid spender", async function () {
      const {
        owner,
        token,
        otherAccount,
        stranger,
        totalSupply,
        message,
        r,
        s,
        v,
      } = await loadFixture(deployFixture);

      expect(await token.balanceOf(await owner.getAddress())).to.equal(
        totalSupply,
      );

      await token.connect(owner).setTokenPool(await otherAccount.getAddress());

      await expect(
        token
          .connect(otherAccount)
          .permit(
            await owner.getAddress(),
            await stranger.getAddress(),
            message.value,
            message.deadline,
            v,
            r,
            s,
          ),
      ).to.be.reverted;
    });
  });
});
