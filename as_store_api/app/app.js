const express = require('express');
const cors = require('cors');
//const morgan = require('morgan');
const authRouter = require('./routes/authRoutes');
const userRouter = require('./routes/userRoutes');
const companyRouter = require('./routes/companyRoutes');
const categoryRouter = require('./routes/categoryRoutes');
const productRouter = require('./routes/productRoutes');
const orderRouter = require('./routes/orderRoutes');
const cartRouter = require('./routes/cartRoutes');
const miscRouter = require('./routes/miscRoutes');
const bpRouter = require('./routes/bpRoutes');
const helmet = require("helmet");
const xss = require('xss-clean');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const loggingMiddleware = require("./middlewares/winston.middleware");
const connectDB = require('../mongoose');

const app = express();

app.use(cors())

// 1) MIDDLEWARES

app.use(helmet());
//app.use(loggingMiddleware);

if (process.env.NODE_ENV === 'development') {
    //app.use(morgan('dev'));
}


// Limit requests from same API
/*const limiter = rateLimit({
    max: 100,
    windowMs: 60 * 60 * 1000,
    message: 'Too many requests from this IP, please try again in an hour!'
});
app.use('/api', limiter);*/


app.use(express.json());
// app.use(express.static(`${__dirname}/public`));
//app.use(express.json({ limit: '10kb' }));

void connectDB();

// Data sanitization against XSS
app.use(xss());

// Prevent parameter pollution
/*app.use(
    hpp({
        whitelist: [
            'duration',
            'ratingsQuantity',
            'ratingsAverage',
            'maxGroupSize',
            'difficulty',
            'price'
        ]
    })
);*/


app.use((req, res, next) => {
    req.requestTime = new Date().toISOString();
    next();
});

// Middleware to set cache-control headers for all responses
app.use((req, res, next) => {
    // Set Cache-Control header to no-cache for all routes
    res.setHeader('Cache-Control', 'no-cache');
    next();
});


// 3) ROUTES
/*app.use('/api/v1/tours', tourRouter);*/
app.use('/auth', authRouter);
app.use('/user', userRouter);
app.use('/company', companyRouter);
app.use('/categories', categoryRouter);
app.use('/products', productRouter);
app.use('/orders', orderRouter);
app.use('/cart', cartRouter);
app.use('/misc', miscRouter);
app.use('/bp', bpRouter);

app.all('*', (req, res, next) => {
    next(new AppError("No resource available", 404));
});

app.use(globalErrorHandler);

module.exports = app;
