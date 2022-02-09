const { expect } = require("chai");
const { ethers } = require("hardhat");
const sleepfor = require("sleepfor");

let owner, staker1, staker2, staker3, GovernanceToken, Staking;
beforeEach(async () => {
  [owner, staker1, staker2, staker3] = await ethers.getSigners();

  // Deploy Governance Token
  const GovernanceToken_Factory = await ethers.getContractFactory(
    "GovernanceToken"
  );
  GovernanceToken = await GovernanceToken_Factory.deploy();
  await GovernanceToken.deployed();

  // Deploy TokenFarm
  const Staking_Factory = await ethers.getContractFactory("Staking");
  Staking = await Staking_Factory.deploy(GovernanceToken.address);
  await Staking.deployed();
});

describe("Testcase 1 : Check if smart contracts have been deployed successfully", () => {
  it("1.1. Is GovernanceToken contract deployed successfully?", async () => {
    expect(GovernanceToken.address).to.not.equal(ethers.constants.AddressZero);
  });
  it("1.2. Is Staking contract deployed successfully?", async () => {
    expect(Staking.address).to.not.equal(ethers.constants.AddressZero);
  });
});

describe("Testcase 2 : Check if staking functionality works", () => {
  it("2.1. It should stake tokens successfully", async () => {
    await GovernanceToken.connect(staker1).mint(staker1.address, 10000);
    await GovernanceToken.connect(staker1).approve(Staking.address, 1000);

    expect(await Staking.connect(staker1).stake(1000))
      .to.emit(Staking, "Staked")
      .withArgs(staker1.address, 1000);

    const res = await Staking.getStakes(staker1.address);
    expect(res.length).to.equal(1);
  });
  it("2.2. It should stake multiple stakers tokens correctly", async () => {
    await GovernanceToken.connect(staker1).mint(staker1.address, 10000);
    await GovernanceToken.connect(staker2).mint(staker2.address, 10000);
    await GovernanceToken.connect(staker3).mint(staker3.address, 10000);
    await GovernanceToken.connect(staker1).approve(Staking.address, 10000);
    await GovernanceToken.connect(staker2).approve(Staking.address, 10000);
    await GovernanceToken.connect(staker3).approve(Staking.address, 10000);

    await Staking.connect(staker1).stake(1500);
    await Staking.connect(staker2).stake(2500);
    await Staking.connect(staker3).stake(4000);
    await Staking.connect(staker1).stake(2700);
    await Staking.connect(staker2).stake(3500);
    await Staking.connect(staker3).stake(4000);

    const res = await Staking.getStakes(staker1.address);
    const res2 = await Staking.getStakes(staker2.address);
    const res3 = await Staking.getStakes(staker3.address);
    expect(res.length).to.equal(2);
    expect(res2.length).to.equal(2);
    expect(res3.length).to.equal(2);
  });

  it("2.2. It should fail if staking amount is 0", async () => {
    await expect(Staking.connect(staker1).stake(0)).to.be.revertedWith(
      "Stake: staking amount must be greater than zero"
    );
  });
  it("2.3. It should fail if tokens are not approved", async () => {
    await GovernanceToken.connect(staker1).mint(staker1.address, 10000);
    await expect(Staking.connect(staker1).stake(1000)).to.be.revertedWith(
      "ERC20: transfer amount exceeds allowance"
    );
  });
});

describe("Testcase 3 : Check if unstaking functionality works", () => {
  it("3.1. It should fail if a random user unstakes someone's token", async () => {
    await GovernanceToken.connect(staker1).mint(staker1.address, 10000);
    await GovernanceToken.connect(staker1).approve(Staking.address, 1000);

    expect(await Staking.connect(staker1).stake(1000))
      .to.emit(Staking, "Staked")
      .withArgs(staker1.address, 1000);

    await expect(Staking.connect(staker2).unstake(1)).to.be.revertedWith(
      "Unstake: Only staker can unstake!"
    );
  });

  it("3.2. It should fail if time has not elapsed for unstake", async () => {
    await GovernanceToken.connect(staker1).mint(staker1.address, 10000);
    await GovernanceToken.connect(staker1).approve(Staking.address, 1000);

    expect(await Staking.connect(staker1).stake(1000))
      .to.emit(Staking, "Staked")
      .withArgs(staker1.address, 1000);

    // Get Release Time
    const stakeObj = await Staking.stakes(1);
    const current = await Staking.getCurrentTimestamp();

    await expect(Staking.connect(staker1).unstake(1)).to.be.revertedWith(
      "Unstake: Time has not elapsed for unstaking"
    );
  });

  // it("3.3.", async () => {
  //   it("3.3. It should unstake token sucessdully", async () => {});
  //   await GovernanceToken.connect(staker1).mint(staker1.address, 10000);
  //   await GovernanceToken.connect(staker1).approve(Staking.address, 1000);

  //   expect(await Staking.connect(staker1).stake(1000))
  //     .to.emit(Staking, "Staked")
  //     .withArgs(staker1.address, 1000);

  //   // Get Release Time
  //   const stakeObj = await Staking.stakes(1);
  //   const current = await Staking.getCurrentTimestamp();

  //   // sleepfor(6000);

  //   await expect(Staking.connect(staker1).unstake(1))
  //     .to.emit(Staking, "Unstaked")
  //     .withArgs(ethers.constants.AddressZero, 0);
  // });
});
