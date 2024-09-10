const express = require("express");
const authController = require("../controllers/authController");
const { authJwt, validator } = require("../middlewares");
const {
  sendOtpValidationRules,
  verifyOtpValidationRules,
  getNewTokenValidationRules,
  logoutValidationRules,
  setPinValidationRules,
  loginWithPinValidationRules,
  adminLoginValidationRules
} = require("../dtos");
const router = express.Router();

router
  .route("/send-otp")
  .post(
    sendOtpValidationRules(),
    validator,
    authJwt.verifyOwnSecret,
    authJwt.validateBodyMsisdn,
    authController.sendOtp
  );

router
  .route("/send-otp-test")
  .post(
    sendOtpValidationRules(),
    validator,
    authJwt.verifyOwnSecret,
    authJwt.validateBodyMsisdn,
    authController.sendOtpTest
  );

router
  .route("/verify-otp")
  .post(
    verifyOtpValidationRules(),
    validator,
    authJwt.verifyOneTimeToken,
    authJwt.validateBodyMsisdn,
    authController.verifyOtp
  );

router
  .route("/verify-otp-test")
  .post(
    verifyOtpValidationRules(),
    validator,
    authJwt.verifyOneTimeToken,
    authJwt.validateBodyMsisdn,
    authController.verifyOtpTest
  );


router
    .route("/login-with-otp")
    .post(
        verifyOtpValidationRules(),
        validator,
        authJwt.verifyOneTimeToken,
        authJwt.validateBodyMsisdn,
        authController.loginWithOtp
    );


router
    .route("/login-with-pin")
    .post(
        loginWithPinValidationRules(),
        validator,
        authJwt.verifyOwnSecret,
        //authJwt.validateBodyMsisdn,
        authController.loginWithPin
    );



router
    .route("/set-pin")
    .post(
        setPinValidationRules(),
        validator,
        authJwt.verifyOneTimeToken,
        authController.setPin
    );


router
  .route("/get-token")
  .post(
    getNewTokenValidationRules(),
    validator,
    authJwt.verifyRefreshToken,
    authController.getNewToken
  );

router
  .route("/logout")
  .post(
    logoutValidationRules(),
    validator,
    authJwt.verifyAccessToken,
    authController.logout
  );

router
  .route("/get-own-secret-for-testing")
  .post(authController.getOwnSecretForTesting);


router
    .route("/admin/login")
    .post(
        adminLoginValidationRules(),
        validator,
        authJwt.verifyOwnSecret,
        authController.adminLogin
    );


router
    .route("/admin/logout")
    .post(
        logoutValidationRules(),
        validator,
        authJwt.bpEitherAccessMiddleware,
        authController.logout
    );


router
    .route("/fulfillment/login")
    .post(
        adminLoginValidationRules(),
        validator,
        authJwt.verifyOwnSecret,
        authController.fulfillmentLogin
    );




module.exports = router;
