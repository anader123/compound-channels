import React, { useState, useEffect } from 'react';

// Components
import LoadingChannels from './Units/LoadChannels';
import ConfirmationBox from './Units/ConfirmationBox';
import InputBox from './Units/InputBox';
import LoadingScreen from './Units/LoadingScreen';
import TransactionBox from './Units/TransactionBox';

// Ethereum
import { formatBeforeSend, addressShortener, loadChannels } from '../Ethereum/EthHelper';
import { repayAsset } from '../Ethereum/ChannelContractFunctions';
import { assetData } from '../Ethereum/AssetData';

import {
  Flex,
  Button
} from 'rebass';

export default function Repay(props) {
  const { setStepDash } = props;

  const [ step, setStep ] = useState(1);
  const [ channels, setChannels ] = useState([]);
  const [ channelDetails, setChannelDetails ] = useState({channelAddress: '0x0000000000000000000000000000000000000000', recipient: '0x0000000000000000000000000000000000000000'});
  const [ txHash, setTxHash ] = useState('');
  const [ channelAddress, setChannelAddress ] = useState('');
  const [ repayAssetDetails, setRepayAssetDetails ] = useState({symbol:'DAI'});
  const [ repayAmount, setRepayAmount ] = useState('');
  const [ channelLoaded, setChannelLoaded ] = useState(false);

  const inputs = [
    {
      label: `Repay Amount (${repayAssetDetails.symbol})`,
      value: repayAmount,
      type: "number",
      fx: setRepayAmount
    }
  ];

  const confirmDetails = [
    `Channel Address: ${addressShortener(channelDetails.channelAddress)}`,
    `Recipient Address: ${addressShortener(channelDetails.recipient)}`,
    `Repay Amount: ${repayAmount} ${repayAssetDetails.symbol}`,
    `Owed Amount: put owed amount here`
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

  const updateChannel = (channel) => {
    setChannelDetails(channel);
    nextStep();
  }

  const setToken = (symbol) => {
    const tokenDetails = assetData.find(token => token.symbol === symbol);
    setRepayAssetDetails(tokenDetails);
  }

  const repayAssetChannel = async () => {
    const  channelAddress = channelDetails.channelAddress;
    const sender = window.ethereum.selectedAddress;
    const decimals = channelDetails.decimals;
    const decimalRepayAmount = await formatBeforeSend(repayAmount, decimals);
    const symbol = channelDetails.symbol;
    const tokenAddress = channelDetails.tokenAddress;

    try{
      repayAsset(
        channelAddress,
        sender,
        decimalRepayAmount,
        symbol,
        tokenAddress
      );
    }
    catch(error) {
      console.log(error);
    }
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
          <InputBox 
            text={true} 
            setToken={setToken} 
            dropDown={true} 
            label={inputLabel} 
            inputs={inputs} 
            textInfo={[]} 
          />
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
        confirmFunction={repayAssetChannel} 
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
