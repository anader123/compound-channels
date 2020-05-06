import React, { useEffect } from 'react';
import { cardBoxFormatting } from '../../theme';
import Dai from '../../Images/dai.png';

// Ethereum 
import { assetData } from '../../Ethereum/AssetData';
import { formatDisplayAmount } from '../../Ethereum/EthHelper';

import {
  Box,
  Card,
  Image,
  Heading,
  Text,
  Flex,
  Button
} from 'rebass';

// Ethereum 
import { addressShortener } from '../../Ethereum/EthHelper';

// Channels Array be created when the user logins. Checks for assoicated channels and stores to redux.

export default function LoadChannels(props) {
  const { setStepDash, updateChannel, channels } = props;
  // Dummy Data
  // const userAddress = window.ethereum.selectedAddress;
  // const channels = [
  //   {
  //     channelAddress: '0xa771B67bF544ACe95431A52BA89Fbf55b861bA83',
  //     recipient: '0xe90b5c01BCD67Ebd0d44372CdA0FD69AfB8c0243',
  //     sender: userAddress,
  //     symbol: 'DAI',
  //     tokenAddress: '0x265c004613279E52746eeE86f6321B5a365Cc88c',
  //     image: Dai,
  //     balance: '10000000000000000000',
  //     formattedBalance: '10'
  //   }
  // ];

  return (
    <Flex sx={{alignItems:'center', justifyContent:'center', flexDirection:'column'}}>
      <Flex width={'75%'} mt={5} m={4} sx={{flexDirection:'column', flexWrap:'wrap', alignItems:'center'}}>
      <Heading mb={3}>Choose a Channel Contract</Heading>
      {channels.length !== 0 ?
      channels.map((channel, index) => {
        return (
          <ChannelBox 
          updateChannel={updateChannel}
            channel={channel}
            key={index}
          />
        )})
      :
      <div>Nothing to show</div>
      }
      </Flex>
      <Button onClick={()=>setStepDash(0)}>Home</Button>
    </Flex>
  )
}

function ChannelBox(props) {
  const { channel, updateChannel } = props;
  return (
    <Box>
      <Card onClick={() => updateChannel(channel)} width={'300px'} sx={cardBoxFormatting}>
        <Heading fontSize={2}>Channel: {addressShortener(channel.channelAddress)}</Heading>
        <Image width={'auto'} m={2} height={'30%'} src={channel.image} />
        <Text>Recipient: {addressShortener(channel.recipient)}</Text>
        <Text>Balance: {channel.formattedBalance} {channel.symbol}</Text>
      </Card>
    </Box>
  )
}
