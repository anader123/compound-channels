import React, { useState, useEffect } from 'react';

// Components
import LoadingChannels from './Units/LoadChannels';
import ConfirmationBox from './Units/ConfirmationBox';
import InputBox from './Units/InputBox';
import LoadingScreen from './Units/LoadingScreen';
import TransactionBox from './Units/TransactionBox';

// Ethereum
import { formatBeforeSend, addressShortener, loadChannels } from '../Ethereum/EthHelper';
import { initalizeERC20, initalizeERC20Channel, initalizeEthChannel } from '../Ethereum/ContractInstances';

import {
  Flex,
  Button
} from 'rebass';

export default function Supply(props) {
  const { setStepDash } = props;

  const [ step, setStep ] = useState(1);
  const [ channels, setChannels ] = useState([]);
  const [ amount, setAmount ] = useState(0); // not converted amount
  const [ channelDetails, setChannelDetails ] = useState({channelAddress: '0x0000000000000000000000000000000000000000', recipient: '0x0000000000000000000000000000000000000000'});
  const [ txHash, setTxHash ] = useState('');
  const [ channelAddress, setChannelAddress ] = useState('');

  const inputs = [
    {
      label: "Amount",
      value: amount,
      type: "number",
      fx: setAmount,
      text: `Balance: ${channelDetails.formattedBalance} ${channelDetails.symbol}`
    }
  ];

  const confirmDetails = [
    `Channel Address: ${addressShortener(channelDetails.channelAddress)}`,
    `Recipient Address: ${addressShortener(channelDetails.recipient)}`,
    `Amount: ${amount} ${channelDetails.symbol}`
  ];

  const getChannels = async () => {
    const userAddress = window.ethereum.selectedAddress;
    const returnChannels = await loadChannels(userAddress, 'sender');
    setChannels(returnChannels);
  }

  useEffect(() => {
    if(channels.length === 0) {
      getChannels();
    }
  }, [channels.length])

  const nextStep = () => {
    const newStep = step + 1;
    setStep(newStep)
  }
  const previousStep = () => {
    const newStep = step - 1;
    setStep(newStep)
  }

  const supplyAssets = async () => {
    const sender = window.ethereum.selectedAddress;
    const tokenAddress = channelDetails.tokenAddress;
    const channelAddress = channelDetails.channelAddress;
    const decimals = channelDetails.decimals;
    const decimalAmount = await formatBeforeSend(amount, decimals);
    let channelContract; 

    if(channelDetails.symbol === 'ETH') {
      channelContract = await initalizeEthChannel(channelAddress);
      channelContract.methods.depositEth().send({from: sender, value: decimalAmount})
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
        setChannelAddress(receipt.events.rChannelCreated.eturnValues.channelAddress);
      })
      .on('error', console.error); 
    }
  }

  const updateChannel = (channel) => {
    setChannelDetails(channel);
    nextStep();
  }

  const inputLabel = `Channel: ${addressShortener(channelDetails.channelAddress)}`;
  const confirmHeading = 'Confirm Deposit Amount';
  
  switch(step) {
    case 1: 
      return (
        <LoadingChannels 
        setStepDash={setStepDash} 
        updateChannel={updateChannel} 
        channels={channels} 
        previousStep={previousStep} 
        nextStep={nextStep} 
        />
      )
    case 2:
      return (
        <Flex flexDirection={'column'} alignItems={'center'} justifyContent={'center'}>
          <InputBox text={true} dropDown={false} label={inputLabel} inputs={inputs} />
          <Flex>
            <Button onClick={previousStep}>Back</Button>
            <Button onClick={nextStep}>Next</Button>
          </Flex>
        </Flex>
      )
    case 3:
      return (
        <ConfirmationBox 
        image={{bool:true, src:channelDetails.image}}
        confirmButton={true}
        confirmHeading={confirmHeading} 
        confirmDetails={confirmDetails} 
        previousStep={previousStep} 
        confirmFunction={supplyAssets} 
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