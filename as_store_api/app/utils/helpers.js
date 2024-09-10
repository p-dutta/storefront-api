const crypto  = require('crypto');
const axios = require('axios');
const jwt = require("jsonwebtoken");
require('dotenv').config();
const config = require("../../config/auth.config");
const otpConfig = require("../../config/otp.config");
const AppError = require("./appError");
const catchAsync = require('./../utils/catchAsync');
const { promisify } = require('util');
const redis = require("../../redis");
const db = require("../models/sequelize");
const logger = require("./logger");
const moment = require("moment/moment");
const {Op} = require("sequelize");
const RefreshToken = db.refreshToken;
const Otp = db.otp;


/*export const getCustomerPreferredLanguage = (msisdn) => {

    const requestBody = {
        //"channel": "string",
        message: otpConfig.message_en,
        msisdn: req.header.msisdn,
        tokenChar: otpConfig.tokenChar,
        tokenLength: otpConfig.tokenLengthString,
        validityInSeconds: otpConfig.validityInSeconds
    };

    /!*  $param = [
        'message' => $message,
          'msisdn' => $msisdn,
          'tokenChar' => $tokenChar,
          'tokenLength' => $tokenLength,
          'validityInSeconds' => $validity,
    ];*!/



    axiosInstanceApiHub.post(`${otpConfig.preferredLanguageEndpoint}88${msisdn}`, requestBody)
        .then(response => {

        })
        .catch(error => {
            if (error.response) {
                // The request was made and the server responded with a status code
                // that falls out of the range of 2xx
                console.log(error.response.data);
                console.log(error.response.status);
                console.log(error.response.headers);
            } else if (error.request) {
                // The request was made but no response was received
                // `error.request` is an instance of XMLHttpRequest in the browser
                // and an instance of http.ClientRequest in node.js
                console.log(error.request);
            } else {
                // Something happened in setting up the request that triggered an Error
                console.log('Error', error.message);
            }

            console.error(error);
            res.status(500).json({ error: 'Failed to fetch data from external API' });
        });


}*/

const generateOneTimeAccessToken = (msisdn) => {

    return jwt.sign(
        {user_type: "as-user", msisdn: msisdn},
        config.oneTimeJwtSecret,
        {expiresIn: config.oneTimeJwtExpiration}
    );

}

const verifyRefreshToken = async (token) => {
    try {
        return await jwt.verify(token, config.refreshTokenSecret);
    } catch (error) {
        return null;
        /*if (error.name === 'JsonWebTokenError') {
        }
        if (error.name === 'TokenExpiredError') {
        }*/
    }
};

const generateTokens = async (msisdn, uid, user_type="as-user") => {

    /*const custom_claim = {
      id: '12345',
      name: 'John Doe',
      email: 'john.doe@example.com',
      role: 'admin'
    };*/

    const accessToken = jwt.sign(
        {user_type: user_type, msisdn: msisdn, uid: uid},
        config.secret,
        {expiresIn: config.jwtExpiration}
    );

    /*const secret = crypto.createHash('sha256').update(process.env.SECRET_FOR_ENCRYPTING_MSISDN).digest();
    //const secret = process.env.SECRET_FOR_ENCRYPTING_MSISDN;
    console.log(secret);

    // Generate a random initialization vector (IV)
    const iv = Buffer.alloc(16, 0);
    console.log(iv);


    // Create a cipher object with the secret key and IV
    const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(secret), iv);

    // Encrypt the string with the cipher
    let encrypted_msisdn = cipher.update(msisdn);
    encrypted_msisdn = Buffer.concat([encrypted_msisdn, cipher.final()]);
    encrypted_msisdn.toString('hex')*/

    //const refreshToken = jwt.sign({ msisdn: req.headers.msisdn }, 'refresh_secret_key');
    const newRefreshToken = jwt.sign(
        {user_type: user_type, msisdn: msisdn, uid: uid},
        config.refreshTokenSecret,
        {expiresIn: config.jwtRefreshExpiration}
    );

    //const setAsync = promisify(redisClient.set).bind(redisClient);
    try {
        await RefreshToken.createToken(newRefreshToken, msisdn, uid);
    } catch (error) {
        await logger("misc").log("error", `Could not save/generate token`, {"error": error});
        const message = `Could not save/generate token`;
        throw new AppError(message, 400);
    }

    try {
        //await redisClient.set(refreshToken, user.email);
        //await redisClient.set(refreshToken, msisdn, "EX",2592000);
        let redisKey = "access:"+uid;
        await redis.set(redisKey, accessToken, "EX", config.jwtExpiration);
    } catch (redis_err) {

        await logger("redis-error").log("error", `Could not save token to redis`, {"error": redis_err});

        console.log(redis_err);
    }
    return {accessToken, newRefreshToken};
}



const generateTokensAdmin = async (msisdn, uid, user_type=["as-user"], companies=[]) => {

    /*const custom_claim = {
      id: '12345',
      name: 'John Doe',
      email: 'john.doe@example.com',
      role: 'admin'
    };*/

    const accessToken = jwt.sign(
        {user_type: user_type, msisdn: msisdn, uid: uid},
        config.secret,
        {expiresIn: config.jwtExpiration}
    );

    /*const secret = crypto.createHash('sha256').update(process.env.SECRET_FOR_ENCRYPTING_MSISDN).digest();
    //const secret = process.env.SECRET_FOR_ENCRYPTING_MSISDN;
    console.log(secret);

    // Generate a random initialization vector (IV)
    const iv = Buffer.alloc(16, 0);
    console.log(iv);


    // Create a cipher object with the secret key and IV
    const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(secret), iv);

    // Encrypt the string with the cipher
    let encrypted_msisdn = cipher.update(msisdn);
    encrypted_msisdn = Buffer.concat([encrypted_msisdn, cipher.final()]);
    encrypted_msisdn.toString('hex')*/

    //const refreshToken = jwt.sign({ msisdn: req.headers.msisdn }, 'refresh_secret_key');
    const newRefreshToken = jwt.sign(
        {user_type: user_type, msisdn: msisdn, uid: uid},
        config.refreshTokenSecret,
        {expiresIn: config.jwtRefreshExpiration}
    );

    //const setAsync = promisify(redisClient.set).bind(redisClient);
    try {
        await RefreshToken.createToken(newRefreshToken, msisdn, uid);
    } catch (error) {
        await logger("misc").log("error", `Could not save/generate token`, {"error": error});
        const message = `Could not save/generate token`;
        throw new AppError(message, 400);
    }

    try {
        let redisKey = msisdn;

        const redisPayload = {
            uid: uid,
            token: accessToken,
            companies: JSON.stringify(companies)
        };

        await redis.hset(redisKey, redisPayload);
        //await redis.hset(redisKey, redisPayload, "EX", config.jwtExpiration);

        await redis.expire(redisKey, config.jwtExpiration);


        // await redis.set(redisKey, accessToken, "EX", config.jwtExpiration);
    } catch (redis_err) {

        await logger("redis-error").log("error", `Could not save token to redis`, {"error": redis_err});

        console.log(redis_err);
    }
    return {accessToken, newRefreshToken};
}


const generateOTP = async (msisdn, length) => {
    let otp = '';
    const characters = '0123456789';
    const charactersLength = characters.length;

    for (let i = 0; i < length; i++) {
        otp += characters.charAt(Math.floor(Math.random() * charactersLength));
    }

    //let otp_expires_at = moment().add(5, "minutes").format('YYYY-MM-DD HH:mm:ss')

    let otpObject = {
        otp,
        msisdn,
        expires_at: moment().add(5, "minutes").unix()
    }
    try {
        await Otp.create(otpObject);
        return otp;

    } catch (error) {
        await logger("otp").log("error", `Could not save OTP`, {"error": error});
        const message = `Could not save OTP`;
        throw new AppError(message, 400);
    }

}


const validateOTP = async (msisdn, otp) => {

    const otpObject = await Otp.findOne({
        where: {
            //msisdn: msisdn,
            expires_at: {
                [Op.gte]: moment().unix()
            },
            msisdn: {
                [Op.eq]: msisdn
            },
            otp: {
                [Op.eq]: otp
            }
        },
        //order: [ [ 'id', 'DESC' ]]
    });
    //let otp_expires_at = moment().add(5, "minutes").format('YYYY-MM-DD HH:mm:ss')


    if (otpObject === null) {
        const message = `Invalid OTP`;
        throw new AppError(message, 401);

    } else {
        return otp;
    }

}





const sendSmsWithOtp = async (msisdn, otp , csmsId) => {
    console.log(msisdn);
    //const messageBody = `Agroshift Your OTP is ${otp}. This OTP will be valid for 5 minutes.`;
    const messageBody = `Agroshift আপনার ওটিপিঃ ${otp}। ওটিপির মেয়াদ 5 মিনিটের মধ্যে শেষ হবে।`;

    const params = {
        api_token: process.env.SMS_API_TOKEN,
        sid: process.env.SMS_SID,
        msisdn: msisdn,
        sms: messageBody,
        csms_id: csmsId
    }

    const url = `${process.env.SMS_BASE_URL}/api/v3/send-sms`;

    try {
        const response = await axios.post(url, params, {
            headers: {
                'Content-Type': 'application/json',
                'accept': 'application/json'
            }
        });
        console.log(response.data)
        return response.data;
    } catch (error) {
        console.log(error)
        await logger("send-otp").log("error", `SMS Sending Error`, {"error": error});
        throw error;
    }

}

const sendSmsWithUsername = async (msisdn, username , csmsId) => {
    console.log(msisdn);
    const messageBody = `Agroshift আপনার ইউজার আইডি: ${username}। পণ্য অর্ডারের সময় এটি ব্যবহার করুন।`;

    const params = {
        api_token: process.env.SMS_API_TOKEN,
        sid: process.env.SMS_SID,
        msisdn: msisdn,
        sms: messageBody,
        csms_id: csmsId
    }

    const url = `${process.env.SMS_BASE_URL}/api/v3/send-sms`;

    try {
        const response = await axios.post(url, params, {
            headers: {
                'Content-Type': 'application/json',
                'accept': 'application/json'
            }
        });
        console.log(response.data)
        return response.data;
    } catch (error) {
        console.log(error)
        await logger("send-username").log("error", `SMS Sending Error`, {"error": error});
        throw error;
    }

}


function currentTimeWithinRange(start_date, end_date) {
    let now = moment();
    let startDate = moment(start_date);
    let endDate = moment(end_date);

    return now.isSameOrAfter(startDate) && now.isSameOrBefore(endDate);
}



    /*

    model.findOne({
    where: { key },
    order: [ [ 'createdAt', 'DESC' ]],
});
    */


module.exports = {
        generateOneTimeAccessToken, verifyRefreshToken, generateTokens,
        generateOTP, validateOTP, sendSmsWithOtp, currentTimeWithinRange, sendSmsWithUsername, generateTokensAdmin
};

