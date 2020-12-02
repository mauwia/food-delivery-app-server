export const expiryCodeGenerator = () => {
  let minutesToAdd = 3;
  let currentDate = new Date();
  return new Date(currentDate.getTime() + minutesToAdd * 60000);
};
export const checkExpiry = (otpArray, OTPCode) => {
  try {
    if (otpArray.length == 0) {
      return { validation: false, message: "Invalid OTP" };
    }
    for (let i = 0; i < otpArray.length; i++) {
      if (OTPCode == otpArray[i].CodeDigit) {
        if (otpArray[i].expiresAt.getTime() > Date.now()) {
          return { validation: true, message: "Validated" };
        } else {
          return { validation: false, message: "OTP Expired" };
        }
      } else {
        return { validation: false, message: "Invalid OTP" };
      }
    }
  } catch (e) {
    throw e;
  }
};
