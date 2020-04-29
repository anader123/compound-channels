import BigNumber from 'bignumber.js';

// Formats data from the blockchain
export const formatDisplayAmount = async (value, ERC20Contract) => {
  const decimals = await ERC20Contract.methods.decimals().call()
  const bn = new BigNumber(value);
  
  return bn.shiftedBy(-decimals).toString(10);
};

// Formats data for transactions that are about to be sent
export const formatBeforeSend = async (value, ERC20Contract) => {
  const decimals = await ERC20Contract.methods.decimals().call()
  const bn = new BigNumber(value);
  
  return bn.shiftedBy(decimals).toString(10);
};

