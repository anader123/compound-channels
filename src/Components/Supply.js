import React, { useState } from 'react';

import LoadChannels from './Units/LoadChannels';

export default function Supply(props) {
  const { setStep, setStepDash } = props;
  const [ channelDetails, setChannelDetails ] = useState({});
  return (
    <LoadChannels setStepDash={setStepDash} />
  )
}
