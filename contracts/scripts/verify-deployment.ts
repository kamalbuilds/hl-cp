import { ethers } from "hardhat";

async function main() {
  console.log("Verifying CopyTrading deployment...");

  // Contract address from deployment
  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

  try {
    // Get the contract instance
    const CopyTrading = await ethers.getContractFactory("CopyTrading");
    const copyTrading = CopyTrading.attach(contractAddress);

    console.log("✅ Contract found at address:", contractAddress);

    // Check if contract is deployed and responsive
    const code = await ethers.provider.getCode(contractAddress);
    if (code === "0x") {
      throw new Error("No contract code found at this address");
    }
    console.log("✅ Contract code exists (length:", code.length, "bytes)");

    // Test basic contract functions
    let feeRecipient = "Not available";
    try {
      feeRecipient = await copyTrading.feeRecipient();
      console.log("✅ Fee recipient:", feeRecipient);
    } catch (error) {
      console.log("⚠️  Could not read fee recipient:", error);
    }

    // Check network details
    const network = await ethers.provider.getNetwork();
    console.log("✅ Connected to network:", {
      name: network.name,
      chainId: network.chainId.toString(),
    });

    // Check deployer balance
    const [deployer] = await ethers.getSigners();
    const balance = await ethers.provider.getBalance(deployer.address);
    console.log("✅ Deployer address:", deployer.address);
    console.log("✅ Deployer balance:", ethers.formatEther(balance), "ETH");

    // Check latest block
    const blockNumber = await ethers.provider.getBlockNumber();
    console.log("✅ Latest block number:", blockNumber);

    console.log("\n🎉 Deployment verification successful!");
    console.log("\n📋 Summary:");
    console.log("Contract Address:", contractAddress);
    console.log("Network: Localhost (Hardhat)");
    console.log("Chain ID: 31337");
    console.log("RPC URL: http://127.0.0.1:8545");
    console.log("Fee Recipient:", feeRecipient);

  } catch (error) {
    console.error("❌ Deployment verification failed:", error);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });