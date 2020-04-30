import React, { useState } from 'react';

import LoadChannels from './Units/LoadChannels';

export default function Borrow(props) {
  const { setStep } = props;
  const [ channelDetails, setChannelDetails ] = useState({});
  return (
    // <div>
    //   Borrow
    //   <button onClick={() => setStep(0)}>Back</button>
    // </div>
    <LoadChannels />
  )
}
