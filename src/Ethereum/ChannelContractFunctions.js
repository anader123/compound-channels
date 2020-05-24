import { 
  factoryContract, 
  initalizeERC20,
  initalizeERC20Channel, 
  initalizeEthChannel 
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
      recipientAddress, 
      +endTime, 
      cTokenAddress
      ).send({from:userAddress, gas:'2000000'})
    .once('transactionHash', (transactionHash) => {
      setStep(step + 1);
      setTxHash(transactionHash);
    })
    .once('receipt', (receipt) => {
      setStep(step + 2);
      setChannelAddress(receipt.events.ChannelCreated.returnValues.channelAddress);
    })
    .on('error', console.error); 
  }
  else {
    // ERC20 token channel
    await factoryContract.methods.createERC20Channel(
      recipientAddress, 
      +endTime, 
      tokenAddress, 
      cTokenAddress
      ).send({from:userAddress, gas:'2000000'})
    .once('transactionHash', (transactionHash) => {
      setStep(step + 1);
      setTxHash(transactionHash);
    })
    .once('receipt', (receipt) => {
      setStep(step + 2);
      setChannelAddress(receipt.events.ChannelCreated.returnValues.channelAddress);
    })
    .on('error', console.error); 
  }
}

export const closeChannel = async (
  symbol,
  userAddress, 
  recipient, 
  channelAddress, 
  decimalAmount,
  signature,
  setStep,
  step,
  setTxHash,
) => {
  if(userAddress === recipient) {
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
    ERC20Contract.methods.approve(channelAddress, decimalAmount).send({from: sender})
    .once('transactionHash', (hash) => {
      channelContract.methods.depositERC20(decimalAmount).send({from: sender})
      .once('transactionHash', (transactionHash) => {
        setStep(step + 1);
        setTxHash(transactionHash);
      })
      .once('receipt', (receipt) => {
        setStep(step + 2);
      })
      .on('error', console.error); 
    });
  }
}

export const borrowAsset = async (
  sender,
  tokenAddress,
  channelAddress,
  decimalGiveAmount,
  decimalBorrowAmount,
  borrowAssetSymbol,
  giveAssetSymbol,
  giveTokenAddress,
  giveTokenCTokenAddress,
  step,
  setStep,
  setTxHash
) => {
  if(borrowAssetSymbol === giveAssetSymbol) {
    window.alert('Please choose another asset to borrow');
    return;
  }
  
  let channelContract;

  if(borrowAssetSymbol === 'ETH') {
    const ERC20Contract = await initalizeERC20(tokenAddress);
    channelContract = await initalizeEthChannel(channelAddress);
    ERC20Contract.methods.approve(channelAddress, decimalGiveAmount).send({from: sender})
    .once('transactionHash', (hash) => {
      channelContract.methods.borrowEthAgainstERC20(
        giveTokenAddress,
        giveTokenCTokenAddress,
        decimalGiveAmount,
        decimalBorrowAmount
      ).send({from: sender})
      .once('transactionHash', (transactionHash) => {
        setStep(step + 1);
        setTxHash(transactionHash);
      })
      .once('receipt', (receipt) => {
        setStep(step + 2);
      })
      .on('error', console.error); 
    })
  }

  else {
    channelContract = await initalizeERC20Channel(channelAddress);
    if(giveAssetSymbol === 'ETH') {

      await channelContract.methods.borrowERC20AgainstETH(
        giveTokenCTokenAddress,
        decimalBorrowAmount
      ).send({from: sender, value: decimalGiveAmount})
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
      ERC20Contract.methods.approve(channelAddress, decimalGiveAmount).send({from: sender})
      .once('transactionHash', (hash) => {
        channelContract.methods.borrowERC20AgainstERC20(
          giveTokenAddress,
          giveTokenCTokenAddress,
          decimalGiveAmount,
          decimalBorrowAmount
        ).send({from: sender})
        .once('transactionHash', (transactionHash) => {
          setTxHash(transactionHash);
          setStep(step + 1);
        })
        .once('receipt', (receipt) => {
          setStep(step + 2);
        })
        .on('error', console.error);
      });
    }
  }
}

export const repayAsset = async (
  channelAddress,
  sender,
  decimalRepayAmount,
  symbol,
  tokenAddress,
  step,
  setStep,
  setTxHash
) => {
  let channelContract;
  if(symbol === 'ETH') {
    // EthChannel that needs to repay token
    channelContract = await initalizeEthChannel(channelAddress);
    channelContract.methods.repayEthBorrowed().send({from:sender, value:decimalRepayAmount})
    .once('transactionHash', (transactionHash) => {
      setTxHash(transactionHash);
      setStep(step + 1);
    })
    .once('receipt', (receipt) => {
      setStep(step + 2);
    })
    .on('error', console.error); 
  }
  else {
    // ERC20Channel that needs to repay token 
    channelContract = await initalizeERC20Channel(channelAddress);
    const ERC20Contract = await initalizeERC20(tokenAddress);
    ERC20Contract.methods.approve(channelAddress, decimalRepayAmount).send({from:sender})
    .once('transactionHash', (hash) => {
      channelContract.methods.repayERC20Borrowed().send({from:sender})
      .once('transactionHash', (transactionHash) => {
        setTxHash(transactionHash);
        setStep(step + 1);
      })
      .once('receipt', (receipt) => {
        setStep(step + 2);
      })
      .on('error', console.error); 
    });
  }
}

export const withdrawLoaned = async (
  channelAddress,
  sender,
  channelSymbol,
  withdrawSymbol,
  tokenAddress,
  cTokenAddress,
  step,
  setStep,
  setTxHash
) => {
  let channelContract;
  if(channelSymbol === 'ETH') {
    channelContract = await initalizeEthChannel(channelAddress);
    channelContract.methods.withdrawLoanedERC20(tokenAddress, cTokenAddress).send({from:sender})
    .once('transactionHash', (transactionHash) => {
      setTxHash(transactionHash);
      setStep(step + 1);
    })
    .once('receipt', (receipt) => {
      setStep(step + 2);
    })
    .on('error', console.error); 
  }
  else {
    channelContract = await initalizeERC20Channel(channelAddress);
    if(withdrawSymbol === 'ETH') {
      channelContract.methods.withdrawLoanedEth(cTokenAddress).send({from:sender})
      .once('transactionHash', (transactionHash) => {
        setTxHash(transactionHash);
        setStep(step + 1);
      })
      .once('receipt', (receipt) => {
        setStep(step + 2);
      })
      .on('error', console.error); 
    }
    else {
      channelContract.methods.withdrawLoanedERC20(tokenAddress, cTokenAddress).send({from:sender})
      .once('transactionHash', (transactionHash) => {
        setTxHash(transactionHash);
        setStep(step + 1);
      })
      .once('receipt', (receipt) => {
        setStep(step + 2);
      })
      .on('error', console.error); 
    }
  }
}
