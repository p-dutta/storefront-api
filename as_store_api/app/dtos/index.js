const guestUserValidationRules = require("./guestUserCreateDto");
const getCustomerBasicInfoValidationRules = require("./getCustomerBasicInfoDto");
const getNewTokenValidationRules = require("./getNewTokenDto");
const logoutValidationRules = require("./logoutDto");
const sendOtpValidationRules = require("./sendOtpDto");
const verifyOtpValidationRules = require("./verifyOtpDto");
const setPinValidationRules = require("./setPinDto");
const loginWithPinValidationRules = require("./loginWithPinDto");
const categoryValidationRules = require("./categoryDto");
const productValidationRules = require("./productDto");
const {orderValidationRules, assistedOrderValidationRules} = require("./orderDto");
const cartValidationRules = require("./cartDto");
const adminLoginValidationRules = require("./adminLoginDto");
const {bpUserSearchValidationRules} = require("./bpDto");

module.exports = {
  guestUserValidationRules,
  getCustomerBasicInfoValidationRules,
  getNewTokenValidationRules,
  logoutValidationRules,
  sendOtpValidationRules,
  verifyOtpValidationRules,
  setPinValidationRules,
  loginWithPinValidationRules,
  categoryValidationRules,
  productValidationRules,
  orderValidationRules,
  cartValidationRules,
  adminLoginValidationRules,
  bpUserSearchValidationRules,
  assistedOrderValidationRules
};
