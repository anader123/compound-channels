import React, { useState } from 'react';

// Ethereum
import { addressShortener, calculateEndTime, formatUnixTime } from '../Ethereum/EthHelper';
import { createChannel } from '../Ethereum/ChannelContractFunctions';
import { assetData } from '../Ethereum/AssetData';


import {
  Flex,
  Button
} from 'rebass';

// Components
import InputBox from './Units/InputBox';
import ConfirmationBox from './Units/ConfirmationBox';
import TransactionBox from './Units/TransactionBox';
import LoadingScreen from './Units/LoadingScreen';

export default function CardBox(props) {
  const { setStepDash } = props; // Dashboard Step Setter
  const [ step, setStep ] = useState(1);
  // Info needed for creating a channel
  const [ hours, setHours] = useState(0);
  const [ days, setDays] = useState(0);
  const [ endTime, setEndTime ] = useState(0);
  const [ formattedEndTime, setFormattedEndTime ] = useState(0);
  const [ recipientAddress, setRecipientAddress ] = useState('');
  const [ assetDetails, setAssetDetails ] = useState(assetData[0]);

  // Transaction Info 
  const [ txHash, setTxHash ] = useState('');
  const [ channelAddress, setChannelAddress ] = useState('');

  const nextStep = async () => {
    const userAddress = window.ethereum.selectedAddress;
    const checkSumUserAddress = window.web3.toChecksumAddress(userAddress);
    if(checkSumUserAddress === recipientAddress) {
      window.alert('Error, the recipient address is the same as your current address');
      return;
    }

    if(recipientAddress.length === 42) {
      if(hours===0 && days===0) {
        window.alert('Please enter a time');
      }
      else {
        const calculatedEndTime = await calculateEndTime(days, hours);
        const formattedTime = await formatUnixTime(calculatedEndTime);
        setFormattedEndTime(formattedTime);
        setEndTime(calculatedEndTime);
        setStep(step + 1);
      }
    }
    else {
      window.alert('Please enter in a valid address.')
    }
  }

  const createNewChannel = async () => {
    const userAddress = window.ethereum.selectedAddress;
    const symbol = assetDetails.symbol;
    const tokenAddress = assetDetails.tokenAddress;
    const cTokenAddress = assetDetails.cTokenAddress;
    
    try {
      createChannel(
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
      )
    }
    catch (error) {
      console.log(error);
    }
  }

  const previousStep = () => {
    setStep(step - 1)
  }

  const setToken = (symbol) => {
    const tokenDetails = assetData.find(token => token.symbol === symbol);
    setAssetDetails(tokenDetails);
  }

  const confirmDetails = [
    `Asset: ${assetDetails.symbol}`,
    `Recipient: ${addressShortener(recipientAddress)}`,
    `End Time: ${formattedEndTime}`
  ]

  const image = {
    bool: true,
    src: assetDetails.image
  }

  const inputs = [
    {
      label: "Recipient Address",
      value: recipientAddress,
      type: "string",
      fx: setRecipientAddress
    },
    {
      label: "Number of Days",
      value: days,
      type: "number",
      fx: setDays
    },
    {
      label: "Number of Hours",
      value: hours,
      type: "number",
      fx: setHours
    }
  ];

  switch(step) {
    case 1: 
      return (
      <Flex flexDirection={'column'} alignItems={'center'} justifyContent={'center'}>
        <InputBox
          label={"Enter Channel Info"} 
          inputs={inputs} 
          setToken={setToken} 
          textInfo={[]}
          dropDown={true} />
          <Flex>
            <Button onClick={()=>setStepDash(0)}>Back</Button>
            <Button onClick={nextStep}>Next</Button>
          </Flex>
      </Flex>
      )
    case 2:
      return (
        <ConfirmationBox 
        image={image}
        confirmButton={true}
        confirmHeading={'Confirm Channel Info'} 
        confirmDetails={confirmDetails} 
        previousStep={previousStep} 
        confirmFunction={createNewChannel} 
        assetDetails={assetDetails}/>
      )
    case 3:
      return (
       <LoadingScreen />
      )
    case 4:
      return (
       <TransactionBox 
       setStepDash={setStepDash} 
       txText={`The channel was created at address: ${addressShortener(channelAddress)}`} txHash={txHash} assetDetails={assetDetails}/>
      )
    default:
      return step;
  }
}