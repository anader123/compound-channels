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

export default function LoadChannels() {
  // Dummy Data
  const channels = [
    {
      channelAddress: '0x10241B0171Ce7a60827010E3374eC6cABCeA0d4C',
      recipient: '0x10231B2271Ce7a60827010E3374eC6cABCeA0d4C',
      symbol: 'DAI',
      image: ''
    }
  ]
  return (
    <Flex sx={{justifyContent:'center'}}>
      <Flex width={'75%'} mt={5} m={4} sx={{flexDirection:'column', flexWrap:'wrap', alignItems:'center'}}>
      <Heading mb={3}>Choose a Channel Contract</Heading>
      {channels.map(channel => {
        return (
          <ChannelBox 
            channelAddress={channel.channelAddress} 
            recipient={channel.recipient} 
            symbol={channel.symbol} 
            image={channel.image}
          />
        )
      })}
      </Flex>
    </Flex>
  )
}

function ChannelBox(props) {
  const { channelAddress , recipient, symbol, image} = props;
  return (
    <Box>
      <Card sx={cardBoxFormatting}>
        <Text fontSize={2}>Channel: {addressShortener(channelAddress)}</Text>
        <Image width={'auto'} m={2} height={'30%'} src={image} />
        <Text>Asset: {symbol}</Text>
        <Text>Recipient: {addressShortener(recipient)}</Text>
      </Card>
    </Box>
  )
}
