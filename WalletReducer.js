import { combineReducers } from 'redux';
import { Sdk } from 'etherspot';
const INITIAL_STATE = {
  currentPk: '',
  currentAdr: '',
  currentSdk: null,
  currentBalance: 0
};
// Different actions to store data
const walletReducer = (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case 'ADD_PK':
      console.log("REDUCER", action.payload);
      return {
        currentPk: action.payload,
        currentAdr: '',
        currentSdk: null,
        currentBalance: 0
      };
    case 'ADD_ADDRESS':
      return {
        currentPk: state.currentPk,
        currentAdr: action.payload,
        currentSdk: state.currentSdk,
        currentBalance: state.currentBalance
      };
    case 'ADD_SDK':
      return {
        currentPk: state.currentPk,
        currentAdr: state.currentAdr,
        currentSdk: action.payload,
        currentBalance: state.currentBalance
      };
    case 'UPDATE_BALANCE':
      return {
        currentPk: state.currentPk,
        currentAdr: state.currentAdr,
        currentSdk: state.currentSdk,
        currentBalance: action.payload
      };
    case 'ADD_WALLET':
      return {
        currentPk: action.payload.walletPk,
        currentAdr: action.payload.walletAdr,
        currentSdk: state.currentSdk,
        currentBalance: state.currentBalance
      };
    default:
      return state
  }
};

export default combineReducers({
  wallets: walletReducer
});