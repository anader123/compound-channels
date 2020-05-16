import { 
  factoryContract, 
  initalizeERC20,
  initalizeERC20Channel, 
  initalizeEthChannel, 
  web3,
  ethChanModel,
  erc20ChanModel,
  comptrollerAddress
} from './ContractInstances';

export const createChannel = async (
  userAddress,
  recipientAddress,
  symbol, 
  endTime,
  tokenAddress, 
  cTokenAddress, 
  setStep, 
  setTxHash,
  setChannelAddress,
  step
) => {
  if(symbol === 'ETH') {
    // Ether channel
    await factoryContract.methods.createEthChannel(
      ethChanModel,
      recipientAddress, 
      endTime, 
      cTokenAddress
      ).send({from:userAddress, gas:'2000000'})
    .once('transactionHash', (transactionHash) => {
      setStep(step + 1);
      setTxHash(transactionHash);
    })
    .once('receipt', (receipt) => {
      console.log(receipt)
      setStep(step + 2);
      setChannelAddress(receipt.events.ChannelCreated.returnValues.channelAddress);
    })
    .on('error', console.error); 
  }
  else {
    // ERC20 token channel
    await factoryContract.methods.createERC20Channel(
      erc20ChanModel,
      recipientAddress, 
      endTime, 
      tokenAddress, 
      cTokenAddress
      ).send({from:userAddress, gas:'2000000'})
    .once('transactionHash', (transactionHash) => {
      setStep(step + 1);
      setTxHash(transactionHash);
    })
    .once('receipt', (receipt) => {
      console.log(receipt)
      setStep(step + 2);
      setChannelAddress(receipt.events.ChannelCreated.returnValues.channelAddress);
    })
    .on('error', console.error); 
  }
}

export const closeChannel = async (
  symbol,
  userAddress, 
  checkSumUserAddress, 
  recipient, 
  channelAddress, 
  decimalAmount,
  signature,
  setStep,
  step,
  setTxHash,
) => {
  if(checkSumUserAddress === recipient) {
    let channelContract;

    // Sets up contract instances
    if(symbol === 'ETH') {
      channelContract = await initalizeEthChannel(channelAddress);
    }
    else {
      channelContract = await initalizeERC20Channel(channelAddress);
    }

    channelContract.methods.close(decimalAmount, signature).send({from: userAddress})
    .once('transactionHash', (transactionHash) => {
      setStep(step + 1);
      setTxHash(transactionHash);
    })
    .once('receipt', (receipt) => {
      setStep(step + 2);
    })
    .on('error', console.error);
  }
  else {
    window.alert('Current address is not the recipient for this channel');
  }
}

export const forceClose = async (
  sender, 
  checkSumUserAddress, 
  channelAddress,
  symbol,
  step,
  setStep,
  setTxHash,
) => {
  let channelContract;

  if(checkSumUserAddress === sender) {
     
    // Sets up contract instances for either Eth or ERC20
    if(symbol === 'ETH') {
      channelContract = await initalizeEthChannel(channelAddress);
    }
    else {
      channelContract = await initalizeERC20Channel(channelAddress);
    }

    channelContract.methods.forceClose().send({from: checkSumUserAddress})
    .once('transactionHash', (transactionHash) => {
      setStep(step + 1);
      setTxHash(transactionHash);
    })
    .once('receipt', (receipt) => {
      setStep(step + 2);
    })
    .on('error', console.error);
  }
  else {
    window.alert('Current address is not the sender for this channel');
  }
}


export const supplyAssets = async (
  sender,
  tokenAddress,
  channelAddress,
  decimalAmount,
  symbol,
  step,
  setStep,
  setTxHash
) => {
  let channelContract; 

  if(symbol === 'ETH') {
    channelContract = await initalizeEthChannel(channelAddress);
    channelContract.methods.depositEth().send({from: sender, value: decimalAmount})
    .once('transactionHash', (transactionHash) => {
      setStep(step + 1);
      setTxHash(transactionHash);
    })
    .once('receipt', (receipt) => {
      setStep(step + 2);
    })
    .on('error', console.error); 
  }
  else {
    const ERC20Contract = await initalizeERC20(tokenAddress);
    channelContract = await initalizeERC20Channel(channelAddress);

    // Approves token and then deposits funds into the channel
    await ERC20Contract.methods.approve(channelAddress, decimalAmount).send({from: sender});
    channelContract.methods.depositERC20(decimalAmount).send({from: sender})
    .once('transactionHash', (transactionHash) => {
      setStep(step + 1);
      setTxHash(transactionHash);
    })
    .once('receipt', (receipt) => {
      setStep(step + 2);
    })
    .on('error', console.error); 
  }
}

export const borrowAsset = async (
  sender,
  tokenAddress,
  channelAddress,
  decimalLoanAmount,
  decimalBorrowAmount,
  borrowAssetSymbol,
  loanedAssetSymbol,
  loanedTokenAddress,
  loandTokenCTokenAddress,
  step,
  setStep,
  setTxHash
) => {
  if(borrowAssetSymbol === loanedAssetSymbol) {
    window.alert('Please choose another asset to borrow');
    return;
  }
  
  let channelContract;

  if(borrowAssetSymbol === 'ETH') {
    const ERC20Contract = await initalizeERC20(tokenAddress);
    await ERC20Contract.methods.approve(
      channelAddress, 
      decimalLoanAmount
    ).send({from: sender});

    channelContract = await initalizeEthChannel(channelAddress);
    channelContract.methods.borrowEthAgainstERC20(
      loanedTokenAddress,
      loandTokenCTokenAddress,
      decimalLoanAmount,
      decimalBorrowAmount,
      comptrollerAddress
    ).send({from: sender})
    .once('transactionHash', (transactionHash) => {
      setStep(step + 1);
      setTxHash(transactionHash);
    })
    .once('receipt', (receipt) => {
      setStep(step + 2);
    })
    .on('error', console.error); 
  }

  else {
    channelContract = await initalizeERC20Channel(channelAddress);
    if(loanedAssetSymbol === 'ETH') {

      await channelContract.methods.borrowERC20AgainstETH(
        loandTokenCTokenAddress,
        decimalBorrowAmount,
        comptrollerAddress
      ).send({from: sender, value: decimalLoanAmount})
      .once('transactionHash', (transactionHash) => {
        setStep(step + 1);
        setTxHash(transactionHash);
      })
      .once('receipt', (receipt) => {
        setStep(step + 2);
      })
      .on('error', console.error); 
    }

    else {
      const ERC20Contract = await initalizeERC20(tokenAddress);
      await ERC20Contract.methods.approve(channelAddress, decimalLoanAmount).send({from: sender});
      await channelContract.methods.borrowERC20AgainstERC20(
        loanedTokenAddress,
        loandTokenCTokenAddress,
        decimalLoanAmount,
        decimalBorrowAmount,
        comptrollerAddress
      ).send({from: sender})
      .once('transactionHash', (transactionHash) => {
        setStep(step + 1);
        setTxHash(transactionHash);
      })
      .once('receipt', (receipt) => {
        setStep(step + 2);
      })
      .on('error', console.error); 
    }
  }
}

export const repayAsset = async (
  channelAddress,
  sender,
  decimalRepayAmount,
  symbol,
  tokenAddress
) => {
  let channelContract;
  if(symbol === 'ETH') {
    // EthChannel that needs to repay token
    channelContract = await initalizeEthChannel(channelAddress);
    channelContract.methods.repayEthBorrowed().send({from:sender, value:decimalRepayAmount}); 
  }
  else {
    // ERC20Channel that needs to repay token 
    channelContract = await initalizeERC20Channel(channelAddress);
    const ERC20Contract = await initalizeERC20(tokenAddress);
    ERC20Contract.methods.approve(channelAddress, decimalRepayAmount).send({from:sender});
    channelContract.methods.repayERC20Borrowed().send({from:sender});
  }
}
