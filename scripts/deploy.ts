import { ethers } from "hardhat";
import hre from "hardhat";

async function main() {
  const MemecoinFactory = await ethers.getContractFactory("Memecoin");

  const name = "Memecoin";
  const symbol = "MMC";
  const totalSupply = ethers.parseEther("1");
  const treasuryWallet = "";

  const memecoin = await MemecoinFactory.deploy(
    name,
    symbol,
    totalSupply,
    treasuryWallet,
  );
  await memecoin.waitForDeployment();

  console.log(await memecoin.getAddress());

  await hre.run("verify:verify", {
    address: await memecoin.getAddress(),
    constructorArguments: [name, symbol, totalSupply, treasuryWallet],
  });
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  throw new Error(error);
});
