import React from 'react';

import {
  Label,
  Select
} from '@rebass/forms';

import { assetData } from '../../Ethereum/AssetData';

export default function TokenDropdown(props) {
  const { label, setToken } = props
  return (
    <div>
      <Label>{label}</Label>
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
              {/* {token.image} */}
              {token.symbol}
            </option>
          )
        })}
      </Select>
    </div>
  )
}