import React from 'react';
import {
  Box,
  Card,
  Image,
  Heading
} from 'rebass';

import { cardBoxFormatting } from '../../theme';

export default function CardBox(props) {
  const { name, step, setStep, image } = props;
  return (
    <Box onClick={() => setStep(step)}>
      <Card sx={cardBoxFormatting}>
        <Image width={'auto'} m={2} height={'30%'} src={image} />
        <Heading>{name}</Heading>
      </Card>
    </Box>
  )
}
