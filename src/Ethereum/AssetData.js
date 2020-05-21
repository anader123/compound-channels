// Images
import DAI from '../Images/dai.png';
import BAT from '../Images/bat.png';
import USDC from '../Images/usdc.png';
import REP from '../Images/rep.png';
import ZRX from '../Images/zrx.png';
import WBTC from '../Images/wbtc.png';
import ETH from '../Images/eth.png';
import USDT from '../Images/tether.png';

// Info is specific to Ropsten
export const assetData = [
  {
    "tokenAddress": "0xB5E5D0F8C0cbA267CD3D7035d6AdC8eBA7Df7Cdd",
    "cTokenAddress": "0x6CE27497A64fFFb5517AA4aeE908b1E7EB63B9fF",
    "symbol": "DAI",
    "name": "DAI Stablecoin",
    "image": DAI,
    "decimals": 18
  },
  {
    "tokenAddress": "0x0000000000000000000000000000000000000000",
    "cTokenAddress": "0x1d70B01A2C3e3B2e56FcdcEfe50d5c5d70109a5D",
    "symbol": "ETH",
    "name": "Ether",
    "image": ETH,
    "decimals": 18
  },
  {
    "tokenAddress": "0x9636246bf34E688c6652Af544418B38eB51D2c43",
    "cTokenAddress": "0xA253295eC2157B8b69C44b2cb35360016DAa25b1",
    "symbol": "BAT",
    "name": "Basic Attention Token",
    "image": BAT,
    "decimals": 18
  },
  {
    "tokenAddress": "0x8a9447df1FB47209D36204e6D56767a33bf20f9f",
    "cTokenAddress": "0x20572e4c090f15667cF7378e16FaD2eA0e2f3EfF",
    "symbol": "USDC",
    "name": "USD Coin",
    "image": USDC,
    "decimals": 6
  },
  {
    "tokenAddress": "0x0A1e4D0B5c71B955c0a5993023fc48bA6E380496",
    "cTokenAddress": "0x5D4373F8C1AF21C391aD7eC755762D8dD3CCA809",
    "symbol": "REP",
    "name": "Augur",
    "image": REP,
    "decimals": 18
  },
  {
    "tokenAddress": "0x19787bcF63E228a6669d905E90aF397DCA313CFC",
    "cTokenAddress": "0x3A728dD027AD6F76Cdea227d5Cf5ba7ce9390A3d",
    "symbol": "ZRX",
    "name": "ZRX Token",
    "image": ZRX,
    "decimals": 18
  },
  {
    "tokenAddress": "0xD83F707f003A1f0B1535028AB356FCE2667ab855",
    "cTokenAddress": "0x4D15eE7DE1f86248c986f5AE7dCE855b1c1A8806",
    "symbol": "WBTC",
    "name": "Wrapped BTC",
    "image": WBTC,
    "decimals": 8
  },
 
  {
    "tokenAddress": "0x6EE856Ae55B6E1A249f04cd3b947141bc146273c",
    "cTokenAddress": "0xb6f7F1901ffbCbadF9cD9831a032395105Bc3142",
    "symbol": "USDT",
    "name": "Tether",
    "image": USDT,
    "decimals": 6
  }
]

// Info is specific to Kovan
// export const assetData = [
//   {
//     "tokenAddress": "0x4F96Fe3b7A6Cf9725f59d353F723c1bDb64CA6Aa",
//     "cTokenAddress": "0xe7bc397dbd069fc7d0109c0636d06888bb50668c",
//     "symbol": "DAI",
//     "name": "DAI Stablecoin",
//     "image": DAI,
//     "decimals": 18
//   },
//   {
//     "tokenAddress": "0x0000000000000000000000000000000000000000",
//     "cTokenAddress": "0xf92FbE0D3C0dcDAE407923b2Ac17eC223b1084E4",
//     "symbol": "ETH",
//     "name": "Ether",
//     "image": ETH,
//     "decimals": 18
//   },
//   {
//     "tokenAddress": "0x9dDB308C14f700d397bB26F584Ac2E303cdc7365",
//     "cTokenAddress": "0xd5ff020f970462816fdd31a603cb7d120e48376e",
//     "symbol": "BAT",
//     "name": "Basic Attention Token",
//     "image": BAT,
//     "decimals": 18
//   },
//   {
//     "tokenAddress": "0x75B0622Cec14130172EaE9Cf166B92E5C112FaFF",
//     "cTokenAddress": "0xcfc9bb230f00bffdb560fce2428b4e05f3442e35",
//     "symbol": "USDC",
//     "name": "USD Coin",
//     "image": USDC,
//     "decimals": 6
//   },
//   {
//     "tokenAddress": "0x4e5cb5a0caca30d1ad27d8cd8200a907854fb518",
//     "cTokenAddress": "0xfd874be7e6733bdc6dca9c7cdd97c225ec235d39",
//     "symbol": "REP",
//     "name": "Augur",
//     "image": REP,
//     "decimals": 18
//   },
//   {
//     "tokenAddress": "0x29eb28bAF3B296b9F14e5e858C52269b57b4dF6E",
//     "cTokenAddress": "0xc014dc10a57ac78350c5fddb26bb66f1cb0960a0",
//     "symbol": "ZRX",
//     "name": "ZRX Token",
//     "image": ZRX,
//     "decimals": 18
//   },
//   {
//     "tokenAddress": "0xA0A5aD2296b38Bd3e3Eb59AAEAF1589E8d9a29A9",
//     "cTokenAddress": "0x3659728876efb2780f498ce829c5b076e496e0e3",
//     "symbol": "WBTC",
//     "name": "Wrapped BTC",
//     "image": WBTC,
//     "decimals": 8
//   },
 
//   // Tether cToken is not deployed to Kovan
// ]