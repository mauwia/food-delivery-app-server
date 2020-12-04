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
        console.log('here2',otpArray[i].CodeDigit,OTPCode,otpArray[i].phoneNo,phoneNo)
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
