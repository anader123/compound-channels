import React, { useState, useEffect } from 'react';

// Components
import LoadingChannels from './Units/LoadChannels';
import ConfirmationBox from './Units/ConfirmationBox';
import InputBox from './Units/InputBox';

import Dai from '../Images/dai.png';

// Ethereum
import { formatBeforeSend, addressShortener, signData, loadChannels } from '../Ethereum/EthHelper';
import { tallCardBoxFormatting } from '../theme';

import {
  Flex,
  Button
} from 'rebass';

export default function Sign(props) {
  const { setStepDash } = props;
  const [ step, setStep ] = useState(1);
  const [ signAmount, setSignAmount ] = useState(0); // not converted amount
  const [ channelDetails, setChannelDetails ] = useState({channelAddress: '0x0000000000000000000000000000000000000000', recipient: '0x0000000000000000000000000000000000000000'});
  const [ signature, setSignature ] = useState('');
  const [ channels, setChannels ] = useState([]);

  const inputs = [
    {
      label: "Amount",
      value: signAmount,
      type: "number",
      fx: setSignAmount,
      text: `Balance: ${channelDetails.formattedBalance} ${channelDetails.symbol}`
    }
  ];

  const confirmDetails = [
    `Channel Address: ${addressShortener(channelDetails.channelAddress)}`,
    `Recipient Address: ${addressShortener(channelDetails.recipient)}`,
    `Amount: ${signAmount} ${channelDetails.symbol}`,
    `Signature: ${signature}`,
  ];

  const getChannels = async () => {
    const userAddress = window.ethereum.selectedAddress;
    const returnChannels = await loadChannels(userAddress, 'sender');
    return returnChannels
  }

  useEffect(() => {
    // const returnChannels = getChannels();
    const userAddress = window.ethereum.selectedAddress;
    const returnChannels = [
      {
        channelAddress: '0xa771B67bF544ACe95431A52BA89Fbf55b861bA83',
        recipient: '0xe90b5c01BCD67Ebd0d44372CdA0FD69AfB8c0243',
        sender: userAddress,
        symbol: 'DAI',
        tokenAddress: '0x265c004613279E52746eeE86f6321B5a365Cc88c',
        image: Dai,
        balance: '10000000000000000000',
        formattedBalance: '10'
      }
    ];
    setChannels(returnChannels);
  }, [])

  const nextStep = () => {
    const newStep = step + 1;
    setStep(newStep)
  }
  const previousStep = () => {
    const newStep = step - 1;
    setStep(newStep)
  }

  const createSig = async () => {
    const userAddress = window.ethereum.selectedAddress;
    const { tokenAddress, channelAddress } = channelDetails;
    const amount = await formatBeforeSend(signAmount, tokenAddress);
    if(+amount <= +channelDetails.balance) {
      await signData(userAddress, amount, channelAddress, setSignature, nextStep);
    }
    else {
      window.alert('Please enter a smaller amount')
    }
  }

  const updateChannel = (channel) => {
    setChannelDetails(channel);
    nextStep();
  }

  const inputLabel = `Channel: ${addressShortener(channelDetails.channelAddress)}`

  switch(step) {
    case 1: 
      return (
        <LoadingChannels channels={channels} setStepDash={setStepDash} updateChannel={updateChannel} previousStep={previousStep} nextStep={nextStep} />
      )
    case 2:
      return (
        <Flex flexDirection={'column'} alignItems={'center'} justifyContent={'center'}>
          <InputBox text={true} dropDown={false} label={inputLabel} inputs={inputs} />
          <Flex>
            <Button onClick={previousStep}>Back</Button>
            <Button onClick={createSig}>Sign</Button>
          </Flex>
        </Flex>
      )
    case 3:
      return (
        <ConfirmationBox 
          image={{bool: false}}
          confirmButton={false}
          previousStep={previousStep} 
          confirmDetails={confirmDetails}
          confirmHeading={"Message Signed"}
        />
      )
    default:
      return step;
  }
}
