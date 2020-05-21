const CompoundChannelFactory = artifacts.require("./CompoundChannelFactory");

require('chai')
.use(require('chai-as-promised'))
.should();

let recipient = "0xe90b5c01BCD67Ebd0d44372CdA0FD69AfB8c0243";
let endTime = 123;
let depositAmount = "10000000000000000000";
// Kovan  
let tokenAddress = "0x4F96Fe3b7A6Cf9725f59d353F723c1bDb64CA6Aa";
let cTokenAddress = "0xe7bc397DBd069fC7d0109C0636d06888bb50668c";
let ERC20ChannelClone = '0xFC9A6dD8dd30217febedf9ab77D593E5Ca1874c7';
let EthChannelClone = '0x5c465A28Fa81DF524B9aCbf0741d6a320c1Eb44E';

//Signature Info 
let channelAddress = '0x05AEf70ad2fD08481f8a49D97a7C952f5a4541A6';
let channelNonce = '1';
let decimalAmount = '0';
let signature = '0xe76c54c6edde20bae8d96e39c9ec90f8ac81a6b012181be1188fd5fd29dbac46670ef4f8383de5d0e3e6c94fb37723c6fafdaeb467b50d3dbdd79e2e3dcace7f1c';

contract('CompoundChannelFactory', async (accounts) => {
  let compoundChannelFactory;
  describe('create channels', () => {
    it('deploys new ERC20 channel', async () => {
      compoundChannelFactory = await CompoundChannelFactory.new(); 
      compoundChannelFactory.createERC20Channel(
        ERC20ChannelClone,
        recipient,
        endTime,
        tokenAddress,
        cTokenAddress
      );
    });

    it('deploys new ETH channel', async () => {
      compoundChannelFactory.createERC20Channel(
        EthChannelClone,
        recipient,
        endTime,
        tokenAddress,
        cTokenAddress
      );
    })
  });

  describe('tests checkSignature function', () => {
    it('returns true for valid signatures',async () => {
      const result = await compoundChannelFactory.checkSignature(
        accounts[0],
        channelAddress,
        channelNonce,
        decimalAmount,
        signature
      );
      result.toString().should.equal(true);
    })
    it("returns false for invalid amount", async () => {
      const result = await compoundChannelFactory.checkSignature(
        accounts[0],
        channelAddress,
        channelNonce,
        '10',
        signature
      );
      result.should.equal(false);
    });
    it("returns false for invalid signature",  async () => {
      const result = await compoundChannelFactory.checkSignature(
        accounts[0],
        channelAddress,
        channelNonce,
        decimalAmount,
        '0x000'
      );
      result.should.equal(false);
    });
    it("returns false for invalid channelNonce", async () => {
      const result = await compoundChannelFactory.checkSignature(
        accounts[0],
        channelAddress,
        '40',
        decimalAmount,
        signature
      );
      result.should.equal(false);
    });
  }) 
})