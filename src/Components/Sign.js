import React, { useState, useEffect } from 'react';

// Components
import LoadingChannels from './Units/LoadChannels';
import InputBox from './Units/InputBox';

// Ethereum
import { 
  formatBeforeSend, 
  addressShortener, 
  signData, 
  loadChannels,
  signatureShortener
} from '../Ethereum/EthHelper';

import {
  Flex,
  Button,
  Heading,
  Card,
  Text, 
  Image
} from 'rebass';
import { tallCardBoxFormatting } from '../theme';
import signImage from '../Images/sign.svg';
import { assetData } from '../Ethereum/AssetData';

export default function Sign(props) {
  const { setStepDash } = props;
  const [ step, setStep ] = useState(1);
  const [ signAmount, setSignAmount ] = useState(0); // not converted amount
  const [ channelDetails, setChannelDetails ] = useState(assetData[0]);
  const [ signature, setSignature ] = useState('');
  const [ channels, setChannels ] = useState([]);
  const [ channelLoaded, setChannelLoaded ] = useState(false);
  const [ copied, setCopied ] = useState(false);

  const inputs = [
    {
      label: `Amount (${channelDetails.symbol})`,
      value: signAmount,
      type: "number",
      fx: setSignAmount
    }
  ];

  const textInfo = [
    `Channel: ${addressShortener(channelDetails.channelAddress)}`,
    `Underlying Balance: ${channelDetails.formattedBalance} ${channelDetails.symbol}`
  ]

  const sigDetails = [
    `Channel: ${addressShortener(channelDetails.channelAddress)}`,
    `Recipient: ${addressShortener(channelDetails.recipient)}`,
    `Amount: ${signAmount} ${channelDetails.symbol}`
  ];

  
  useEffect(() => {
    if(channels.length === 0) {
      getChannels();
    }
  }, [channels.length]);

  const copySignature = () => {
    navigator.clipboard.writeText(signature);
    setCopied(true);
    setTimeout(() => {setCopied(false)}, 800);
  }
  
  const nextStep = () => {
    const newStep = step + 1;
    setStep(newStep)
  }
  const previousStep = () => {
    const newStep = step - 1;
    setStep(newStep)
  }
  
  const getChannels = async () => {
    const userAddress = window.ethereum.selectedAddress;
    const returnChannels = await loadChannels(userAddress, 'sender');
    setChannels(returnChannels);
    setChannelLoaded(true);
  }

  const createSig = async () => {
    const userAddress = window.ethereum.selectedAddress;
    const { decimals, channelAddress, channelNonce } = channelDetails;
    const amount = await formatBeforeSend(signAmount, decimals);
    if(+signAmount <= +channelDetails.formattedBalance) {
      await signData(
        userAddress, 
        amount, 
        channelAddress, 
        setSignature, 
        nextStep,
        channelNonce
      );
    }
    else {
      window.alert('Please enter a smaller amount')
    }
  }

  const updateChannel = (channel) => {
    setChannelDetails(channel);
    nextStep();
  }

  switch(step) {
    case 1: 
      return (
        <LoadingChannels 
        channels={channels} 
        setStepDash={setStepDash} 
        updateChannel={updateChannel} 
        previousStep={previousStep} 
        nextStep={nextStep} 
        channelLoaded={channelLoaded}
        addressType={'sender address'}
        />
      )
    case 2:
      return (
        <Flex flexDirection={'column'} alignItems={'center'} justifyContent={'center'}>
          <InputBox textInfo={textInfo} dropDown={false} label={'Sign an Amount'} inputs={inputs} />
          <Flex>
            <Button onClick={previousStep}>Back</Button>
            <Button onClick={createSig}>Sign</Button>
          </Flex>
        </Flex>
      )
    case 3:
      return (
      <Flex flexDirection={'column'} alignItems={'center'} justifyContent={'center'}>
        <Card sx={tallCardBoxFormatting} height={'400px'}>
          <Flex flexDirection={'column'} alignItems={'center'}>
            <Heading sx={{textDecoration:'underline'}} mb={'35px'}>{"Message Signed"}</Heading>
            <Flex sx={{flexDirection:'column', justifyContent:'flex-start', alignItems:'space-around', marginBottom:'10px'}}>
            {sigDetails.map((text, index) => {
              return <Text key={index}>{text}</Text>
            })}
            </Flex>
            <Image m={'10px'} width={70} height={70} src={signImage}/>
            <Text>Signature: {signatureShortener(signature)}</Text>
          </Flex>
          <Button onClick={copySignature}>Copy Signature</Button>
          <Flex height={'20px'}>{copied ? <Text>Copied!</Text> : <div/>}</Flex>
        </Card>
        <Flex>
            <Button onClick={previousStep}>Back</Button>
            <Button onClick={() => setStepDash(0)}>Home</Button>
        </Flex>
      </Flex>
      )
    default:
      return step;
  }
}
