const AppError = require('./../utils/appError');

const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    status_code: err.statusCode,
    error: err,
    message: err.message,
    stack: err.stack
  });
};

const sendErrorProd = (err, res) => {
  console.error('ERROR:', err);
  // Operational, trusted error: send message to client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      status_code: err.bodyStatusCode,
      message: err.message,
    });

    // Programming or other unknown error: don't leak error details
  } else {
    // 1) Log error
    console.error('ERROR:', err);

    // 2) Send generic message
    res.status(500).json({
      status: "FAIL",
      status_code: 500,
      message: "Something went wrong",
    });
  }
};


const handleJWTError = () =>
    new AppError('Invalid token. Please log in again!', 401);

const handleJWTExpiredError = () =>
    new AppError('Your token has expired! Please log in again.', 401, 498);

const handleSequelizeUniqueConstraintError = () =>
    new AppError('Duplicate entry', 409);


module.exports = (err, req, res, next) => {
  // console.log(err.stack);
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'FAIL';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...err };

    if (error.name === 'JsonWebTokenError') error = handleJWTError();
    if (error.name === 'TokenExpiredError') error = handleJWTExpiredError();
    if (error.name === 'SequelizeUniqueConstraintError') error = handleSequelizeUniqueConstraintError();

    sendErrorProd(error, res);
  }
};
