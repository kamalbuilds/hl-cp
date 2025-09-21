import { ethers } from "hardhat";

async function main() {
  // Top traders with realistic profiles
  const TRADERS_DATA = [
    {
      name: "CryptoWhale",
      bio: "Professional trader with 5+ years in crypto derivatives. Specializing in BTC and ETH momentum strategies.",
      performanceFee: 2000, // 20%
      minCopyAmount: ethers.parseEther("0.1"),
      maxCopyAmount: ethers.parseEther("10"),
    },
    {
      name: "DeFiMaster",
      bio: "Quantitative trader leveraging on-chain analytics and DeFi yield strategies. Risk-adjusted returns focus.",
      performanceFee: 1500, // 15%
      minCopyAmount: ethers.parseEther("0.05"),
      maxCopyAmount: ethers.parseEther("5"),
    },
    {
      name: "VolumeHunter",
      bio: "High-frequency trader capitalizing on volume spikes and market inefficiencies. 24/7 automated strategies.",
      performanceFee: 2500, // 25%
      minCopyAmount: ethers.parseEther("0.2"),
      maxCopyAmount: ethers.parseEther("20"),
    },
    {
      name: "SafeHands",
      bio: "Conservative trader focused on capital preservation. Low leverage, high win rate strategies.",
      performanceFee: 1000, // 10%
      minCopyAmount: ethers.parseEther("0.01"),
      maxCopyAmount: ethers.parseEther("2"),
    },
    {
      name: "MomentumKing",
      bio: "Trend following expert catching major market moves. Specializing in breakout patterns and momentum shifts.",
      performanceFee: 3000, // 30%
      minCopyAmount: ethers.parseEther("0.5"),
      maxCopyAmount: ethers.parseEther("50"),
    }
  ];

  // Realistic copy positions
  const COPY_POSITIONS = [
    { traderIndex: 0, copiers: 45, totalVolume: "125000", totalPnL: "12500" },
    { traderIndex: 1, copiers: 32, totalVolume: "87000", totalPnL: "6500" },
    { traderIndex: 2, copiers: 78, totalVolume: "450000", totalPnL: "38000" },
    { traderIndex: 3, copiers: 23, totalVolume: "35000", totalPnL: "2800" },
    { traderIndex: 4, copiers: 56, totalVolume: "280000", totalPnL: "-5200" },
  ];
  console.log("🚀 Populating HyperMirror with realistic data...\n");

  // Get signers
  const signers = await ethers.getSigners();
  const deployer = signers[0];

  // Get the deployed contract
  const contractAddress = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0";
  const HyperCoreCopyTrading = await ethers.getContractFactory("HyperCoreCopyTrading");
  const contract = HyperCoreCopyTrading.attach(contractAddress);

  console.log("📍 Contract Address:", contractAddress);
  console.log("👤 Deployer:", deployer.address);
  console.log("\n" + "=".repeat(60) + "\n");

  // Register traders
  console.log("📝 Registering Professional Traders...\n");

  for (let i = 0; i < TRADERS_DATA.length; i++) {
    const trader = TRADERS_DATA[i];
    const traderSigner = signers[i + 1]; // Use different signers as traders

    if (!traderSigner) {
      console.log(`⚠️  Skipping trader ${i + 1} - not enough signers`);
      continue;
    }

    try {
      console.log(`👤 Registering ${trader.name}...`);
      const tx = await contract.connect(traderSigner).registerAsTrader(
        trader.name,
        trader.bio,
        trader.performanceFee,
        trader.minCopyAmount,
        trader.maxCopyAmount
      );
      await tx.wait();

      console.log(`   ✅ ${trader.name} registered at ${traderSigner.address}`);
      console.log(`   📊 Performance Fee: ${trader.performanceFee / 100}%`);
      console.log(`   💰 Copy Range: ${ethers.formatEther(trader.minCopyAmount)} - ${ethers.formatEther(trader.maxCopyAmount)} ETH\n`);
    } catch (error: any) {
      if (error.message.includes("Already registered")) {
        console.log(`   ℹ️  ${trader.name} already registered\n`);
      } else {
        console.log(`   ❌ Failed to register ${trader.name}:`, error.message, "\n");
      }
    }
  }

  console.log("=".repeat(60) + "\n");

  // Add some copiers
  console.log("👥 Setting up Copy Trading Positions...\n");

  for (let i = 6; i < Math.min(10, signers.length); i++) {
    const copier = signers[i];
    const traderIndex = i % 3; // Copy first 3 traders
    const traderAddress = signers[traderIndex + 1].address;
    const copyAmount = ethers.parseEther((0.1 + Math.random() * 0.4).toFixed(2));
    const leverage = Math.floor(5 + Math.random() * 15); // 5x to 20x leverage

    try {
      console.log(`📋 Copier ${i - 5} copying ${TRADERS_DATA[traderIndex].name}...`);
      const tx = await contract.connect(copier).startCopying(
        traderAddress,
        leverage,
        true, // copyPerps
        false, // copySpot
        { value: copyAmount }
      );
      await tx.wait();

      console.log(`   ✅ Started copying with ${ethers.formatEther(copyAmount)} ETH at ${leverage}x leverage\n`);
    } catch (error: any) {
      if (error.message.includes("Already copying")) {
        console.log(`   ℹ️  Already copying this trader\n`);
      } else {
        console.log(`   ⚠️  Failed to start copying:`, error.message, "\n");
      }
    }
  }

  console.log("=".repeat(60) + "\n");

  // Place some sample orders (these won't execute on HyperCore but will emit events)
  console.log("📈 Placing Sample Trading Orders...\n");

  const markets = ['BTC-USD', 'ETH-USD', 'SOL-USD'];
  const orderTypes = [
    { asset: 0, isBuy: true, price: 45000, size: 0.01, tif: 2 }, // BTC Long
    { asset: 1, isBuy: false, price: 3500, size: 0.1, tif: 2 }, // ETH Short
    { asset: 2, isBuy: true, price: 120, size: 1, tif: 1 }, // SOL Long
  ];

  for (let i = 0; i < Math.min(3, signers.length - 1); i++) {
    const trader = signers[i + 1];
    const order = orderTypes[i];

    try {
      console.log(`📊 ${TRADERS_DATA[i].name} placing ${order.isBuy ? 'BUY' : 'SELL'} order on ${markets[order.asset]}...`);

      const tx = await contract.connect(trader).placeLimitOrder(
        order.asset,
        order.isBuy,
        BigInt(Math.floor(order.price * 1e8)), // Convert to 1e8 precision
        BigInt(Math.floor(order.size * 1e8)),
        false, // reduceOnly
        order.tif
      );
      await tx.wait();

      console.log(`   ✅ Order placed: ${order.size} ${markets[order.asset].split('-')[0]} at $${order.price}\n`);
    } catch (error: any) {
      console.log(`   ⚠️  Order failed:`, error.message.substring(0, 100), "\n");
    }
  }

  console.log("=".repeat(60) + "\n");

  // Display summary
  console.log("📊 Platform Summary:\n");

  const allTraders = await contract.getAllTraders();
  console.log(`✅ Total Registered Traders: ${allTraders.length}`);

  for (let i = 0; i < Math.min(allTraders.length, 5); i++) {
    const info = await contract.getTraderInfo(allTraders[i]);
    console.log(`\n👤 ${info.name}`);
    console.log(`   📍 Address: ${allTraders[i]}`);
    console.log(`   💰 Performance Fee: ${Number(info.performanceFee) / 100}%`);
    console.log(`   👥 Total Copiers: ${info.totalCopiers}`);
  }

  console.log("\n" + "=".repeat(60));
  console.log("\n✨ Data population complete! The platform now has:");
  console.log("   • Professional traders with detailed profiles");
  console.log("   • Active copy trading relationships");
  console.log("   • Sample trading orders");
  console.log("   • Realistic fee structures");
  console.log("\n🎯 Visit http://localhost:3000 to see the populated frontend!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Error:", error);
    process.exit(1);
  });