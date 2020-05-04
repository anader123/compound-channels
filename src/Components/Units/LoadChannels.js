import React, { useEffect } from 'react';
import { assetData } from '../../Ethereum/AssetData';
import { cardBoxFormatting } from '../../theme';

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
      symbol: 'DAI',
      tokenAddress: '0x265c004613279E52746eeE86f6321B5a365Cc88c',
      image: ''
    }
  ]
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
      <Card onClick={() => updateChannel(channel)} sx={cardBoxFormatting}>
        <Text fontSize={2}>Channel: {addressShortener(channel.channelAddress)}</Text>
        <Image width={'auto'} m={2} height={'30%'} src={channel.image} />
        <Text>Asset: {channel.symbol}</Text>
        <Text>Recipient: {addressShortener(channel.recipient)}</Text>
      </Card>
    </Box>
  )
}
