import React from 'react';
import ReactLoading from 'react-loading';
import { tallCardBoxFormatting } from '../../theme';


import {
  Flex,
  Card,
  Heading
} from 'rebass';

export default function LoadingScreen() {
  return (
    <Flex flexDirection={'column'} alignItems={'center'} justifyContent={'center'}>
      <Card sx={tallCardBoxFormatting}>
        <Flex height={'300px'} flexDirection={'column'} alignItems={'center'}>
          <Heading sx={{textDecoration:'underline'}} mb={4}>Transaction in Progress</Heading>
          <ReactLoading type={'cubes'} color={'#47d395'} width={'190px'} />
        </Flex>
      </Card>
    </Flex>
  )
}
