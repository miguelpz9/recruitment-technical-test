// Export the actions to store data on redux
export const addPk = (walletPk) => {
    return {
      type: 'ADD_PK',
      payload: walletPk,
    }
}
export const addAddress = (adr) => {
  return {
    type: 'ADD_ADDRESS',
    payload: adr,
  }
}
export const addSdk = (sdk) => {
  return {
    type: 'ADD_SDK',
    payload: sdk,
  }
}
export const updateBalance = (balance) => {
  return {
    type: 'UPDATE_BALANCE',
    payload: balance,
  }
}
export const addWallet = (walletPk, walletAdr) => {
  return {
    type: 'ADD_WALLET',
    payload: {walletPk, walletAdr},
  }
}