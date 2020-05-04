const CompoundChannelFactory = artifacts.require("./CompoundChannelFactory");
const CompoundChannel = artifacts.require("./CompoundChannel");
const { mintDai } = require('../src/Ethereum/mintDai');

require('chai')
.use(require('chai-as-promised'))
.should();

let recipient = "0xe90b5c01BCD67Ebd0d44372CdA0FD69AfB8c0243";
let endTime = 123;
let depositAmount = "10000000000000000000";
// Kovan Dai 
let tokenAddress = "0x4F96Fe3b7A6Cf9725f59d353F723c1bDb64CA6Aa";
let cTokenAddress = "0xe7bc397DBd069fC7d0109C0636d06888bb50668c";

constract('CompoundChannelFactory', (accounts) => {
  describe('deployment', () => {
    it('deploys new channel', async () => {
      const compoundChannelFactory = await CompoundChannelFactory.new(); 
      compoundChannelFactory.createChannel(
        recipient,
        endTime,
        tokenAddress,
        cTokenAddress
      );
    })
  })
})