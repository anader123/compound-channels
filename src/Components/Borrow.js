import React, { useState, useEffect } from 'react';

// Components
import LoadingChannels from './Units/LoadChannels';
import ConfirmationBox from './Units/ConfirmationBox';
import InputBox from './Units/InputBox';
import LoadingScreen from './Units/LoadingScreen';
import TransactionBox from './Units/TransactionBox';

// Ethereum
import { formatBeforeSend, addressShortener, loadChannels } from '../Ethereum/EthHelper';
import { initalizeERC20, initalizeERC20Channel, initalizeEthChannel, comptrollerAddress } from '../Ethereum/ContractInstances';

import { assetData } from '../Ethereum/AssetData';

import {
  Flex,
  Button
} from 'rebass';

export default function Borrow(props) {
  const { setStepDash } = props;

  const [ step, setStep ] = useState(1);
  const [ channels, setChannels ] = useState([]);
  const [ channelDetails, setChannelDetails ] = useState({channelAddress: '0x0000000000000000000000000000000000000000', recipient: '0x0000000000000000000000000000000000000000'});
  const [ txHash, setTxHash ] = useState('');
  const [ channelAddress, setChannelAddress ] = useState('');
  const [ loanedAssetDetails, setLoanedAssetDetails ] = useState({symbol:'DAI'});
  const [ borrowAmount, setBorrowAmount ] = useState('');
  const [ loanAmount, setLoanAmount ] = useState('');
  const [ channelLoaded, setChannelLoaded ] = useState(false);

  const inputs = [
    {
      label: `Loan Amount (${loanedAssetDetails.symbol})`,
      value: loanAmount,
      type: "number",
      fx: setLoanAmount
    },
    {
      label: `Borrow Amount (${channelDetails.symbol})`,
      value: borrowAmount,
      type: "number",
      fx: setBorrowAmount
    }
  ];

  const confirmDetails = [
    `Channel Address: ${addressShortener(channelDetails.channelAddress)}`,
    `Recipient Address: ${addressShortener(channelDetails.recipient)}`,
    `Loan Amount: ${loanAmount} ${loanedAssetDetails.symbol}`,
    `Borrow Amount: ${borrowAmount} ${channelDetails.symbol}`
  ];

  const getChannels = async () => {
    const userAddress = window.ethereum.selectedAddress;
    const returnChannels = await loadChannels(userAddress, 'sender');
    setChannels(returnChannels);
    setChannelLoaded(true);
  }

  useEffect(() => {
    if(channels.length === 0) {
      getChannels();
    }
  },[channels.length])

  const nextStep = () => {
    const newStep = step + 1;
    setStep(newStep)
  }
  const previousStep = () => {
    const newStep = step - 1;
    setStep(newStep)
  }

  // FIXME: need to reconfigure for borrow 
  const borrowAsset = async () => {
    const sender = window.ethereum.selectedAddress;
    const tokenAddress = channelDetails.tokenAddress;
    const channelAddress = channelDetails.channelAddress;
    const decimals = channelDetails.decimals;

    if(channelDetails.symbol === loanedAssetDetails.symbol) {
      window.alert('Please choose another asset to borrow');
      return;
    }
    
    let channelContract;
    const decimalLoanAmount = await formatBeforeSend(loanAmount, decimals);
    const decimalBorrowAmount = await formatBeforeSend(borrowAmount, decimals);

    if(channelDetails.symbol === 'ETH') {
      const ERC20Contract = await initalizeERC20(tokenAddress);
      await ERC20Contract.methods.approve(
        channelAddress, 
        decimalLoanAmount
      ).send({from: sender});

      channelContract = await initalizeEthChannel(channelAddress);
      channelContract.methods.borrowEthAgainstERC20(
        loanedAssetDetails.tokenAddress,
        loanedAssetDetails.cTokenAddress,
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
        setChannelAddress(receipt.events.rChannelCreated.eturnValues.channelAddress);
      })
      .on('error', console.error); 
    }

    else {
      channelContract = await initalizeERC20Channel(channelAddress);
      if(loanedAssetDetails.symbol === 'ETH') {
        console.log(loanedAssetDetails)
        await channelContract.methods.borrowERC20AgainstETH(
          loanedAssetDetails.cTokenAddress,
          decimalBorrowAmount,
          comptrollerAddress
        ).send({from: sender, value: decimalLoanAmount})
        .once('transactionHash', (transactionHash) => {
          setStep(step + 1);
          setTxHash(transactionHash);
        })
        .once('receipt', (receipt) => {
          setStep(step + 2);
          setChannelAddress(receipt.events.rChannelCreated.eturnValues.channelAddress);
        })
        .on('error', console.error); 
      }

      else {
        const ERC20Contract = await initalizeERC20(tokenAddress);
        await ERC20Contract.methods.approve(channelAddress, decimalLoanAmount).send({from: sender});
        await channelContract.methods.borrowERC20AgainstERC20(
          loanedAssetDetails.tokenAddress,
          loanedAssetDetails.cTokenAddress,
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
          setChannelAddress(receipt.events.rChannelCreated.eturnValues.channelAddress);
        })
        .on('error', console.error); 
      }
    }
  }

  const updateChannel = (channel) => {
    setChannelDetails(channel);
    nextStep();
  }

  const setLoanedAsset = (symbol) => {
    const assetDetails = assetData.find(asset => asset.symbol === symbol);
    setLoanedAssetDetails(assetDetails);
  }

  const inputLabel = `Channel: ${addressShortener(channelDetails.channelAddress)}`;
  const confirmHeading = 'Confirm your Transaction';
  
  switch(step) {
    case 1: 
      return (
        <LoadingChannels 
        setStepDash={setStepDash} 
        updateChannel={updateChannel} 
        channels={channels} 
        previousStep={previousStep} 
        nextStep={nextStep} 
        channelLoaded={channelLoaded}
        addressType={'sender address'}
        />
      )
    case 2:
      return (
        <Flex flexDirection={'column'} alignItems={'center'} justifyContent={'center'}>
          <InputBox text={true} setToken={setLoanedAsset} dropDown={true} label={inputLabel} inputs={inputs} />
          <Flex>
            <Button onClick={previousStep}>Back</Button>
            <Button onClick={nextStep}>Next</Button>
          </Flex>
        </Flex>
      )
    case 3:
      return (
        <ConfirmationBox 
        image={{bool:false}}
        confirmButton={true}
        confirmHeading={confirmHeading} 
        confirmDetails={confirmDetails} 
        previousStep={previousStep} 
        confirmFunction={borrowAsset} 
        />
      )
    case 4:
      return (
        <LoadingScreen />
      )
    case 5:
      return (
        <TransactionBox setStepDash={setStepDash} channelAddress={channelAddress} txHash={txHash}/>
      )
    default:
      return step;
  }
}
