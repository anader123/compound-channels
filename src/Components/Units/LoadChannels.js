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

import ReactLoading from 'react-loading';

// Ethereum 
import { addressShortener } from '../../Ethereum/EthHelper';

export default function LoadChannels(props) {
  const { 
    setStepDash, 
    updateChannel, 
    channels, 
    addressType,
    channelLoaded 
  } = props;
  return (
    <Flex sx={{alignItems:'center', justifyContent:'center', flexDirection:'column'}}>
      <Heading mb={3}>Choose a Channel Contract</Heading>
      {channelLoaded && channels.length === 0 ? 
        <Text>This address isn't a {addressType} for any channel.</Text>:
        <LoadingBox updateChannel={updateChannel} channels={channels}/>
      }
      <Button onClick={()=>setStepDash(0)}>Back</Button>
    </Flex>
  )
}

function LoadingBox(props) {
  const { channels, updateChannel } = props;
  return(
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
        <Flex sx={{ height:'200px'}}>
          <ReactLoading type={'spin'} color={'#47d395'} width={160}></ReactLoading>
        </Flex>
      }
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
