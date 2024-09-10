const jwt = require("jsonwebtoken");
const config = require("../../config/auth.config.js");
const db = require("../../db");
const redis = require("../../redis");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const {promisify} = require("util");
const {createHmac} = require("crypto");
const logger = require("../utils/logger");


// For customers
const verifyAccessToken = catchAsync(async (req, res, next) => {
  let token;
  if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(
        new AppError('You have not logged in! Please log in to get access.', 401)
    );
  }

  const decoded = await promisify(jwt.verify)(token, config.secret);

  try {
    let redisKey = "access:"+decoded.uid;
    const cachedAccessToken = await redis.get(redisKey);
    if (cachedAccessToken) {
      req.userInfo = decoded;
      return next();
    } else {
      return next(
          new AppError('Invalid token', 401)
      );
    }
  } catch (redis_error) {
    await logger("redis-error").log("error", `${req.method} ${req.url}`, { "error": redis_error });
    console.log("could not connect to redis server while checking access token");
    // the below two lines of codes make sure that if redis lookup fail due to some external issue
    // and token signature was valid, customer can still continue. This is just a fallback mechanism
    req.userInfo = decoded;
    next();
  }
});


const verifyRefreshToken = catchAsync(async (req, res, next) => {
  let token;
  if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(
        new AppError('Invalid refresh token. Please login again', 401)
    );
  }


  const decoded = await promisify(jwt.verify)(token, config.refreshTokenSecret);
  req.userInfo = decoded;
  req.refreshToken = token;
  next();

});



const verifyOneTimeToken = catchAsync(async (req, res, next) => {
  let token;
  if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(
        new AppError('Invalid Request', 400)
    );
  }

  try {
    const decoded = await promisify(jwt.verify)(token, config.oneTimeJwtSecret);
    req.userInfo = decoded;
    next();
  } catch (error) {
    console.log(error);
    return next(
        new AppError('Invalid or Expired Token', 401)
    );
  }

});


const verifyOwnSecret = catchAsync(async (req, res, next) => {

  let client_hash;

  if (req.headers.secret) {
    client_hash = req.headers.secret;
  } else {
    return next(
        new AppError('Invalid request', 401)
    );
  }

  const secret = process.env.OWN_HASH_SECRET;
  const hash = createHmac('sha256', secret)
      .update(`${process.env.OWN_HASH_KEY}${req.headers.timestamp}`)
      .digest('hex');

  if(client_hash !== hash) {
    return next(
        new AppError('Invalid request', 401)
    )
  }
  next();

});


const validateHeaderMsisdn = catchAsync(async (req, res, next) => {

  //const numberRegex = /(^(\+88|0088)?(01){1}[3456789]{1}(\d){8})$/;
  const numberRegex = /^(?:\+?88)?01[13-9]\d{8}$/;

  if (numberRegex.test(req.headers.msisdn)) {
    next();
  } else {
    return next(
        new AppError('You have provided an invalid number', 422)
    );
  }

});



const validateBodyMsisdn = catchAsync(async (req, res, next) => {

  const numberRegex = /^(?:\+?88)?01[13-9]\d{8}$/;
  if (numberRegex.test(req.body.msisdn)) {
    next();
  } else {
    return next(
        new AppError('You have provided an invalid number', 422)
    );
  }

});


// For BP App
const verifyBpOrderAccess = catchAsync(async (req, res, next) => {
  let token;
  if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(
        new AppError('You have not logged in! Please log in to get access.', 401)
    );
  }

  const decoded = await promisify(jwt.verify)(token, config.secret);
  if(decoded) {
    if(
        (!decoded.user_type.includes("bp_order")
        && !decoded.user_type.includes("administrator")
        && !decoded.user_type.includes("bp_leader"))
    ) {
      return next(
          new AppError('You are not authorized to make this request', 401)
      );
    }
  }

  try {
    let redisKey = decoded.msisdn;
    //const cachedAccessToken = await redis.get(redisKey);
    const redisUserInfo = await redis.hgetall(redisKey);
    //const cachedAccessToken = await redis.hget(redisKey, "token");
    if (redisUserInfo && redisUserInfo.token && redisUserInfo.token === token) {
      req.userInfo = {
        user_type: decoded.user_type,
        msisdn: decoded.msisdn,
        uid: decoded.uid,
        iat: decoded.iat,
        exp: decoded.exp,
        companies: JSON.parse(redisUserInfo.companies)
      };

      return next();
    } else {
      return next(
          new AppError('Invalid token', 401)
      );
    }
  } catch (redis_error) {
    await logger("redis-error").log("error", `${req.method} ${req.url}`, { "error": redis_error });
    console.log("could not connect to redis server while checking access token");
    // the below two lines of codes make sure that if redis lookup fails due to some external issue
    // and token signature was valid, customer can still continue. This is just a fallback mechanism
    req.userInfo = decoded;
    next();
  }
});


// For fulfillment app
  const verifyBpDeliveryAccess = catchAsync(async (req, res, next) => {
    let token;
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return next(
          new AppError('You have not logged in! Please log in to get access.', 401)
      );
    }

    const decoded = await promisify(jwt.verify)(token, config.secret);
    if(decoded) {
      if(
          (!decoded.user_type.includes("bp_delivery")
              && !decoded.user_type.includes("administrator")
              && !decoded.user_type.includes("bp_leader"))
      ) {
        return next(
            new AppError('You are not authorized to make this request', 401)
        );
      }
    }

    try {
      let redisKey = decoded.msisdn;
      //const cachedAccessToken = await redis.get(redisKey);
      const redisUserInfo = await redis.hgetall(redisKey);
      //const cachedAccessToken = await redis.hget(redisKey, "token");
      if (redisUserInfo && redisUserInfo.token && redisUserInfo.token === token) {
        req.userInfo = {
          user_type: decoded.user_type,
          msisdn: decoded.msisdn,
          uid: decoded.uid,
          iat: decoded.iat,
          exp: decoded.exp,
          companies: JSON.parse(redisUserInfo.companies)
        };

        return next();
      } else {
        return next(
            new AppError('Invalid token', 401)
        );
      }
    } catch (redis_error) {
      await logger("redis-error").log("error", `${req.method} ${req.url}`, { "error": redis_error });
      console.log("could not connect to redis server while checking access token");
      // the below two lines of codes make sure that if redis lookup fails due to some external issue
      // and token signature was valid, customer can still continue. This is just a fallback mechanism
      req.userInfo = decoded;
      next();
    }
  });


const bpEitherAccessMiddleware = catchAsync(async (req, res, next) => {
  let token;
  if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(
        new AppError('You have not logged in! Please log in to get access.', 401)
    );
  }

  const decoded = await promisify(jwt.verify)(token, config.secret);
  if(decoded) {
    if (!decoded.user_type.includes("bp_order")
        && !decoded.user_type.includes("bp_delivery")
        && !decoded.user_type.includes("administrator")
        && !decoded.user_type.includes("bp_leader")
    ) {
      return next(
          new AppError('You are not authorized to make this request', 401)
      );
    }
  }

  try {
    let redisKey = decoded.msisdn;
    //const cachedAccessToken = await redis.get(redisKey);
    const redisUserInfo = await redis.hgetall(redisKey);
    //const cachedAccessToken = await redis.hget(redisKey, "token");
    if (redisUserInfo && redisUserInfo.token && redisUserInfo.token === token) {
      req.userInfo = {
        user_type: decoded.user_type,
        msisdn: decoded.msisdn,
        uid: decoded.uid,
        iat: decoded.iat,
        exp: decoded.exp,
        companies: JSON.parse(redisUserInfo.companies)
      };

      return next();
    } else {
      return next(
          new AppError('Invalid token', 401)
      );
    }
  } catch (redis_error) {
    await logger("redis-error").log("error", `${req.method} ${req.url}`, { "error": redis_error });
    console.log("could not connect to redis server while checking access token");
    // the below two lines of codes make sure that if redis lookup fails due to some external issue
    // and token signature was valid, customer can still continue. This is just a fallback mechanism
    req.userInfo = decoded;
    next();
  }
});





const authJwt = {
  verifyOneTimeToken: verifyOneTimeToken,
  verifyOwnSecret: verifyOwnSecret,
  validateHeaderMsisdn: validateHeaderMsisdn,
  verifyAccessToken: verifyAccessToken,
  verifyRefreshToken: verifyRefreshToken,
  validateBodyMsisdn: validateBodyMsisdn,
  verifyBpOrderAccess: verifyBpOrderAccess,
  verifyBpDeliveryAccess: verifyBpDeliveryAccess,
  bpEitherAccessMiddleware: bpEitherAccessMiddleware,
};
module.exports = authJwt;
