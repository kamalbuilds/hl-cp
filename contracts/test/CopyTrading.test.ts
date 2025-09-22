import { expect } from "chai";
import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import { CopyTrading } from "../typechain-types";

describe("CopyTrading", function () {
  let copyTrading: CopyTrading;
  let owner: SignerWithAddress;
  let trader: SignerWithAddress;
  let copier: SignerWithAddress;
  let feeRecipient: SignerWithAddress;
  let addrs: SignerWithAddress[];

  beforeEach(async function () {
    [owner, trader, copier, feeRecipient, ...addrs] = await ethers.getSigners();

    const CopyTrading = await ethers.getContractFactory("CopyTrading");
    copyTrading = await CopyTrading.deploy(feeRecipient.address);
    await copyTrading.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await copyTrading.owner()).to.equal(owner.address);
    });

    it("Should set the fee recipient", async function () {
      expect(await copyTrading.feeRecipient()).to.equal(feeRecipient.address);
    });
  });

  describe("Trader Registration", function () {
    it("Should register a trader", async function () {
      const feeRate = 500; // 5%
      const maxCopyAmount = ethers.parseEther("100");

      await expect(
        copyTrading.connect(trader).registerTrader(feeRate, maxCopyAmount)
      ).to.emit(copyTrading, "TraderRegistered")
        .withArgs(trader.address, feeRate, maxCopyAmount);

      const registeredTraders = await copyTrading.getRegisteredTraders();
      expect(registeredTraders).to.include(trader.address);
    });

    it("Should not allow fee rate above 10%", async function () {
      const feeRate = 1001; // > 10%
      const maxCopyAmount = ethers.parseEther("100");

      await expect(
        copyTrading.connect(trader).registerTrader(feeRate, maxCopyAmount)
      ).to.be.revertedWith("Fee rate too high");
    });

    it("Should verify a trader by owner", async function () {
      const feeRate = 500;
      const maxCopyAmount = ethers.parseEther("100");

      await copyTrading.connect(trader).registerTrader(feeRate, maxCopyAmount);

      await expect(
        copyTrading.connect(owner).verifyTrader(trader.address)
      ).to.emit(copyTrading, "TraderVerified")
        .withArgs(trader.address);
    });
  });

  describe("Copy Settings", function () {
    beforeEach(async function () {
      // Register and verify trader
      await copyTrading.connect(trader).registerTrader(500, ethers.parseEther("100"));
      await copyTrading.connect(owner).verifyTrader(trader.address);

      // Deposit funds for copier
      await copyTrading.connect(copier).deposit({ value: ethers.parseEther("10") });
    });

    it("Should set copy settings", async function () {
      const allocation = 2500; // 25%
      const maxPositionSize = ethers.parseEther("5");
      const stopLoss = 500; // 5%
      const takeProfit = 1000; // 10%
      const riskMultiplier = 10000; // 1x

      await expect(
        copyTrading.connect(copier).setCopySettings(
          trader.address,
          allocation,
          maxPositionSize,
          stopLoss,
          takeProfit,
          riskMultiplier
        )
      ).to.emit(copyTrading, "CopySettingsUpdated")
        .withArgs(copier.address, trader.address, allocation);
    });

    it("Should not allow copying unverified trader", async function () {
      const unverifiedTrader = addrs[0];
      await copyTrading.connect(unverifiedTrader).registerTrader(500, ethers.parseEther("100"));

      await expect(
        copyTrading.connect(copier).setCopySettings(
          unverifiedTrader.address,
          2500,
          ethers.parseEther("5"),
          500,
          1000,
          10000
        )
      ).to.be.revertedWith("Trader not verified");
    });
  });

  describe("Trading", function () {
    beforeEach(async function () {
      // Register and verify trader
      await copyTrading.connect(trader).registerTrader(500, ethers.parseEther("100"));
      await copyTrading.connect(owner).verifyTrader(trader.address);
    });

    it("Should execute a trade by verified trader", async function () {
      const symbol = "BTC-USD";
      const isLong = true;
      const size = ethers.parseEther("1");
      const price = ethers.parseEther("40000");
      const leverage = 2000; // 20x

      await expect(
        copyTrading.connect(trader).executeTrade(symbol, isLong, size, price, leverage)
      ).to.emit(copyTrading, "TradeExecuted")
        .withArgs(trader.address, symbol, isLong, size, price);
    });

    it("Should not allow unverified trader to execute trade", async function () {
      const unverifiedTrader = addrs[0];

      await expect(
        copyTrading.connect(unverifiedTrader).executeTrade(
          "BTC-USD",
          true,
          ethers.parseEther("1"),
          ethers.parseEther("40000"),
          2000
        )
      ).to.be.revertedWith("Not verified trader");
    });
  });

  describe("Funds Management", function () {
    it("Should allow deposit", async function () {
      const depositAmount = ethers.parseEther("5");

      await expect(
        copyTrading.connect(copier).deposit({ value: depositAmount })
      ).to.emit(copyTrading, "FundsDeposited")
        .withArgs(copier.address, depositAmount);

      expect(await copyTrading.userBalances(copier.address)).to.equal(depositAmount);
    });

    it("Should allow withdrawal", async function () {
      const depositAmount = ethers.parseEther("5");
      const withdrawAmount = ethers.parseEther("2");

      await copyTrading.connect(copier).deposit({ value: depositAmount });

      await expect(
        copyTrading.connect(copier).withdraw(withdrawAmount)
      ).to.emit(copyTrading, "FundsWithdrawn")
        .withArgs(copier.address, withdrawAmount);

      expect(await copyTrading.userBalances(copier.address)).to.equal(
        depositAmount - withdrawAmount
      );
    });

    it("Should not allow withdrawal above balance", async function () {
      const depositAmount = ethers.parseEther("1");
      const withdrawAmount = ethers.parseEther("2");

      await copyTrading.connect(copier).deposit({ value: depositAmount });

      await expect(
        copyTrading.connect(copier).withdraw(withdrawAmount)
      ).to.be.revertedWith("Insufficient balance");
    });
  });

  describe("Platform Management", function () {
    it("Should allow owner to pause contract", async function () {
      await copyTrading.connect(owner).pause();
      expect(await copyTrading.paused()).to.be.true;
    });

    it("Should allow owner to unpause contract", async function () {
      await copyTrading.connect(owner).pause();
      await copyTrading.connect(owner).unpause();
      expect(await copyTrading.paused()).to.be.false;
    });

    it("Should not allow non-owner to pause", async function () {
      await expect(
        copyTrading.connect(trader).pause()
      ).to.be.reverted;
    });

    it("Should update platform fee rate", async function () {
      const newFeeRate = 200; // 2%
      await copyTrading.connect(owner).updatePlatformFeeRate(newFeeRate);
      expect(await copyTrading.platformFeeRate()).to.equal(newFeeRate);
    });
  });
});