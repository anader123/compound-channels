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
  Flex
} from 'rebass';

// Ethereum 
import { addressShortener } from '../../Ethereum/EthHelper';

// Channels Array be created when the user logins. Checks for assoicated channels and stores to redux.

export default function LoadChannels(props) {
  const { nextStep, previousStep, updateChannel } = props;
  // Dummy Data
  const channels = [
    {
      channelAddress: '0x10241B0171Ce7a60827010E3374eC6cABCeA0d4C',
      recipient: '0x10231B2271Ce7a60827010E3374eC6cABCeA0d4C',
      sender: '0x265c004613279E52746eeE86f6321B5a365Cc88c',
      symbol: 'DAI',
      tokenAddress: '0x265c004613279E52746eeE86f6321B5a365Cc88c',
      image: Dai,
      balance: '10000000000000000000000000',
      formattedBalance: '100'
    }
  ];

  return (
    <Flex sx={{justifyContent:'center'}}>
      <Flex width={'75%'} mt={5} m={4} sx={{flexDirection:'column', flexWrap:'wrap', alignItems:'center'}}>
      <Heading mb={3}>Choose a Channel Contract</Heading>
      {channels.map((channel, index) => {
        return (
          <ChannelBox 
          updateChannel={updateChannel}
            channel={channel}
            key={index}
          />
        )
      })}
      </Flex>
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
