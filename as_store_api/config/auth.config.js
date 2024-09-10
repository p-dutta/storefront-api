require('dotenv').config();

module.exports = {
  secret: process.env.SECRET,
  refreshTokenSecret: process.env.REFRESH_TOKEN_SECRET,
  jwtExpiration: parseInt(process.env.JWT_EXPIRATION, 10),
  jwtRefreshExpiration: parseInt(process.env.JWT_REFRESH_EXPIRATION, 10),
  oneTimeJwtSecret: process.env.ONE_TIME_JWT_SECRET,
  oneTimeJwtExpiration: parseInt(process.env.ONE_TIME_JWT_EXPIRATION, 10),
};
