export const expiryCodeGenerator = () => {
  let minutesToAdd = 3;
  let currentDate = new Date();
  return new Date(currentDate.getTime() + minutesToAdd * 60000);
};
export const checkExpiry = (otpArray, OTPCode) => {
  try {
      let f=0
    if (otpArray.length == 0) {
      return { validation: false, message: "Invalid OTP" };
    }
    console.log('here1',otpArray.length)
    for (let i = 0; i < otpArray.length; i++) {
        console.log('here2',otpArray[i],OTPCode)
      if (OTPCode == otpArray[i].CodeDigit) {
          f=1
        if (otpArray[i].expiresAt.getTime() > Date.now()) {
          return { validation: true, message: "Validated" };
        } else {
          return { validation: false, message: "OTP Expired" };
        }
      } else {
        f=0
      }
    }
    if(!f){
      return { validation: false, message: "Invalid OTP" };
    }
  } catch (e) {
    throw e;
  }
};
