import React from 'react';
import { cardBoxFormatting } from '../../theme';
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

export default function LoadChannels(props) {
  const { setStepDash, updateChannel, channels } = props;
  return (
    <Flex sx={{alignItems:'center', justifyContent:'center', flexDirection:'column'}}>
      <Heading mb={3}>Choose a Channel Contract</Heading>
      <Flex width={'75%'} mt={5} m={4} sx={{ flexWrap:'wrap', justifyContent:'center'}}>
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
      <Heading>Loading...</Heading>
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
