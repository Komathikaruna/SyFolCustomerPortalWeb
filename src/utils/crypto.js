import store from '../store/index'
const CryptoJS = require('crypto-js')

export const encrypt = (data, secretKey = process.env.VUE_APP_SECRETE_KEY) => {
  return (process.env.NODE_ENV === 'production') ? CryptoJS.AES.encrypt(JSON.stringify(data), secretKey).toString() : data
}

export const decrypt = (data, secretKey = process.env.VUE_APP_SECRETE_KEY) => {
  try {
    return (process.env.NODE_ENV === 'production') ? JSON.parse(CryptoJS.AES.decrypt(data, secretKey).toString(CryptoJS.enc.Utf8)) : data
  } catch (error) {
    store.dispatch('logout')
  }
}
