import { ethers } from "hardhat";

async function main() {
  console.log("Deploying HyperCoreCopyTrading contract...");

  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);

  // Check deployer balance
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", ethers.formatEther(balance));

  // Deploy the HyperCoreCopyTrading contract
  const HyperCoreCopyTrading = await ethers.getContractFactory("HyperCoreCopyTrading");

  // Set the fee recipient (could be deployer or a different address)
  const feeRecipient = deployer.address;

  const copyTrading = await HyperCoreCopyTrading.deploy(feeRecipient);
  await copyTrading.waitForDeployment();

  const contractAddress = await copyTrading.getAddress();
  console.log("HyperCoreCopyTrading contract deployed to:", contractAddress);
  console.log("Fee recipient set to:", feeRecipient);

  // Verify contract on block explorer (if not on localhost)
  if (process.env.HARDHAT_NETWORK !== "hardhat" && process.env.HARDHAT_NETWORK !== "localhost") {
    console.log("Waiting for block confirmations...");
    await copyTrading.deploymentTransaction()?.wait(6);

    console.log("Verifying contract...");
    try {
      await run("verify:verify", {
        address: contractAddress,
        constructorArguments: [feeRecipient],
      });
      console.log("Contract verified successfully!");
    } catch (error) {
      console.error("Error verifying contract:", error);
    }
  }

  // Output deployment info for frontend
  const deploymentInfo = {
    network: process.env.HARDHAT_NETWORK || "hardhat",
    contractAddress,
    feeRecipient,
    deployedBy: deployer.address,
    deployedAt: new Date().toISOString(),
  };

  console.log("\n=== Deployment Summary ===");
  console.log(JSON.stringify(deploymentInfo, null, 2));
  console.log("==========================\n");

  // Save deployment info to file
  const fs = require("fs");
  const path = require("path");
  const deploymentsDir = path.join(__dirname, "../deployments");

  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir);
  }

  fs.writeFileSync(
    path.join(deploymentsDir, `${process.env.HARDHAT_NETWORK || "hardhat"}.json`),
    JSON.stringify(deploymentInfo, null, 2)
  );

  console.log("Deployment info saved to deployments folder");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });