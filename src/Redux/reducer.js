const initialState = {
  userAddress: '',
  walletConnected: false,
  channelContract: {},
  borrowContract: {},
  ERC20Contract: {}
}

// Action Types

// Reducer
export default function reducer(state = initialState, action) {
  switch(action.type) {
    default:
      return state;
  }
}