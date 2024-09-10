module.exports = {
  tokenLengthString: "SIX",
  tokenLengthNumber: 6,
  validityInSeconds: 300,
  otpAutoReadKey: "9ua99nBlS+G",
  tokenChar: "#",
  message_bn: `আপনার ওটিপিঃ # । আপনার ওটিপির মেয়াদ 5 মিনিটের মধ্যে শেষ হবে। ${process.env.OTP_AUTO_READ_KEY}`,
  message_en: `Your OTP is # . This OTP will be expired within 5 minutes. ${process.env.OTP_AUTO_READ_KEY}`,
  preferredLanguageEndpoint: "/customer-information/customer-information/customer-information/get-language/channel/MobileApp/msisdn/"
};
