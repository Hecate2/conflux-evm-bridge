const { ethers } = require('hardhat');
const { upgrades } = require('hardhat');
require('dotenv').config();

module.exports = async ({ getNamedAccounts, deployments, network }) => {
  const { log } = deployments;
  const { deployer } = await getNamedAccounts();

  if (!process.env.PRIVATE_KEY) {
    throw new Error('PRIVATE_KEY not set or invalid in environment variables');
  }

  // Deploy the new implementation using OpenZeppelin upgrades
  const UpgradeableERC20 = await ethers.getContractFactory('UpgradeableERC20');
  const implementationAddress = await upgrades.deployImplementation(UpgradeableERC20, {
    kind: 'beacon'
  });

  log(`Deployed new implementation at ${implementationAddress}`);

  // Get the beacon contract
  const beaconAddress = process.env.BEACON_ADDRESS;
  if (!beaconAddress) {
    throw new Error('BEACON_ADDRESS not set in .env file');
  }
  const beacon = await ethers.getContractAt('UpgradeableBeacon', beaconAddress);

  // Upgrade the beacon to point to the new implementation
  const tx = await beacon.upgradeTo(implementationAddress);
  await tx.wait();

  log(`Upgraded beacon ${beaconAddress} to new implementation ${implementationAddress}`);
};

module.exports.tags = ['upgrade-erc20', 'mainnet'];