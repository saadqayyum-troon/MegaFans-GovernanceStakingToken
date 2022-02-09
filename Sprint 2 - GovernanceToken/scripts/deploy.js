const hre = require("hardhat");

async function main() {
  const GovernanceToken_Factory = await hre.ethers.getContractFactory(
    "GovernanceToken"
  );
  const GovernanceToken = await GovernanceToken_Factory.deploy();
  await GovernanceToken.deployed();

  console.log("GovernanceToken is deployed to:", GovernanceToken.address);

  // Deploy TokenFarm
  const Staking_Factory = await ethers.getContractFactory("Staking");
  const Staking = await Staking_Factory.deploy(GovernanceToken.address);
  await Staking.deployed();
  console.log("Staking Contract is deployed to:", Staking.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
