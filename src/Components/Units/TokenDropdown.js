import React from 'react';

import {
  Label,
  Select
} from '@rebass/forms';

import { assetData } from '../../Ethereum/AssetData';

export default function TokenDropdown(props) {
  const { setToken } = props;
  return (
    <div>
      <Label sx={{color:'#b1babf', fontSize:'0.87em'}} pb={1}>Select an Asset</Label>
      <Select
        onChange={(e) => setToken(e.target.value)}
        id='token'
        name='token'
        defaultValue='DAI'
        width={'150px'}
      >
        {assetData.map((token, key) => {
          return(
            <option key={key}>
              {token.symbol}
            </option>
          )
        })}
      </Select>
    </div>
  )
}
