const CompoundChannelFactory = artifacts.require("CompoundChannelFactory");
const CompoundChannel = artifacts.require('CompoundChannel');
// const { mintDai } = require('../src/Ethereum/mintDai');

module.exports = async function(deployer) {
  await deployer.deploy(CompoundChannelFactory);
  // mintDai();
};