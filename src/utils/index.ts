const axios = require('axios');
​
const url = "https://testnet-dex.binance.org/";
// const url = "https://dex.binance.org/";
​
// const address = 'bnb1zdq592rftg7m7pwavp4gtl7s622s3e8njqlf9r'
// const address = 'tbnb1lj3d8nwd4x86c7j33hfk5nwj47v4h9sc8q8ghq'
let address='tbnb10p25yqtm8ple4yeeqx5w6uvr3mcvn8sdca6zmx'
​
let changeableUrl = `${url}api/v1/transactions?address=${address}`
export const expiryCodeGenerator = () => {
  let minutesToAdd = 5;
  let currentDate = new Date();
  return new Date(currentDate.getTime() + minutesToAdd * 60000);
};
export const checkExpiry = (otpArray, OTPCode,phoneNo) => {
  try {
      let f=0
    if (otpArray.length == 0) {
      return { validated: false, message: "Invalid OTP" };
    }
    for (let i = 0; i < otpArray.length; i++) {
        // console.log('here2',otpArray[i].CodeDigit,OTPCode,otpArray[i].phoneNo,phoneNo)
      if (OTPCode == otpArray[i].CodeDigit && phoneNo==otpArray[i].phoneNo ) {
          f=1
        if (otpArray[i].expiresAt.getTime() > Date.now()) {
          return { validated: true};
        } else {
          return { validated: false, message: "OTP Expired" };
        }
      } else {
        f=0
      }
    }
    if(!f){
      return { validated: false, message: "Invalid OTP" };
    }
  } catch (e) {
    throw e;
  }
};

export const pad=(n,width)=>{
  let z = '0';
  n = n + '';
  return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
}
export const getTransactions=async()=> {
  let res
  await axios.get(changeableUrl)
      .then((response) => {
          console.log(response.data);
          res=response.data
      });
      return res
}
export const bnbToNosh =async ()=>{
    let bnbToUsd=await axios.get("https://api.coingecko.com/api/v3/simple/price?ids=binancecoin&vs_currencies=usd")
    let UsdToNGN=await axios.get("https://free.currconv.com/api/v7/convert?q=NGN_USD&compact=ultra&apiKey=43b461102cb29d164c9b")
    let conversion=bnbToUsd.data.binancecoin.usd/UsdToNGN.data.NGN_USD
    // console.log(conversion*0.2)
    return conversion
  }
