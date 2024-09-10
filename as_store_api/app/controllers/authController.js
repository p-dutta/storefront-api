const { Sequelize, Op } = require("sequelize");
const db = require("../models/sequelize");
const config = require("../../config/auth.config");
const otpConfig = require("../../config/otp.config");
// const { RefreshToken, Customer, Company, HrData } = db;
const RefreshToken = db.refreshToken;
const Customer = db.customer;
const Company = db.company;
const HrData = db.hrData;
const AdminUser = db.adminUser;
//const AdminUserCompany = db.adminUserCompany;
const AdminRole = db.adminRole;
const catchAsync = require("../utils/catchAsync");
const redis = require("../../redis");
const AppError = require("../utils/appError");
//const axiosInstanceApiHub = require("../utils/axiosInterceptors");
const ApiSuccessResponse = require("../utils/successfulApiResponse");
const moment = require("moment");
const { createHmac } = require("crypto");
const {
    generateOneTimeAccessToken,
    verifyRefreshToken,
    generateTokens,
    generateOTP,
    validateOTP, sendSmsWithOtp, sendSmsWithUsername, generateTokensAdmin
} = require("../utils/helpers");
const logger = require("../utils/logger");
const { v4: uuidv4 } = require("uuid");
const bcrypt = require("bcrypt");

const sendOtp = async (req, res, next) => {

    try {

        const customer = await Customer.findOne({
            where: { phone: req.body.msisdn },
            attributes: ['email', 'phone', 'uid']
        });

        if (customer === null) {
            let otp = await generateOTP(req.body.msisdn, 4);
            const uniqueId = uuidv4().replace(/-/g, '').slice(0, 20);

            let responseData = await sendSmsWithOtp(req.body.msisdn, otp, uniqueId);

            if (responseData.status_code === 200) {
                let otpToken = generateOneTimeAccessToken(req.body.msisdn);

                let data = {
                    validation_time: otpConfig.validityInSeconds,
                    msisdn: req.body.msisdn,
                    otp_token: otpToken
                };

                let apiSuccessResponse = new ApiSuccessResponse("OTP Sent Successfully", 200, data)

                apiSuccessResponse.sendResponse(res);
            } else {
                await logger("send-otp").log("error", `OTP Sending Error`, { "error": responseData });
                return next(
                    new AppError("OTP service unavailable", 503)
                );
            }
        } else {
            return next(
                new AppError('You already have an account. Please login with PIN', 400)
            );

        }

    } catch (otp_generation_error) {
        return next(
            new AppError("OTP service unavailable", 503)
        );
    }

}


const sendOtpTest = async (req, res, next) => {

    let otp = "1234";

    let otp_token = generateOneTimeAccessToken(req.body.msisdn);

    let data = {
        validation_time: otpConfig.validityInSeconds,
        otp_token
    };

    let apiSuccessResponse = new ApiSuccessResponse("OTP Sent Successfully", 200, data)

    apiSuccessResponse.sendResponse(res);

}


const verifyOtp = catchAsync(async (req, res, next) => {

    if (req.userInfo.msisdn === req.body.msisdn) {

        try {

            let otp = await validateOTP(req.body.msisdn, req.body.otp);
            if (otp) {
                const customer = await Customer.findOne({
                    where: { phone: req.body.msisdn }
                });

                let oneTimeAccessToken = generateOneTimeAccessToken(req.body.msisdn);

                if (customer === null) {

                    let return_data = {
                        validation_time: otpConfig.validityInSeconds,
                        one_time_token: oneTimeAccessToken,
                        msisdn: req.body.msisdn,
                        has_logged_in: false
                    }

                    let apiSuccessResponse = new ApiSuccessResponse("OTP Successfully Verified", 200, return_data);
                    apiSuccessResponse.sendResponse(res);

                } else {

                    let return_data = {
                        validation_time: otpConfig.validityInSeconds,
                        one_time_token: oneTimeAccessToken,
                        name: customer.name ? customer.name : "",
                        uid: customer.uid,
                        msisdn: customer.phone,
                        company_id: customer?.company?.id,
                        company_name: customer?.company?.company_name,
                        emp_id: customer.emp_id ? customer.emp_id : "",
                        has_logged_in: !!customer.first_login_at,
                        first_login_at: moment(customer.first_login_at).format("YYYY-MM-DD HH:mm:ss"),
                    }

                    let apiSuccessResponse = new ApiSuccessResponse("OTP Successfully Verified", 200, return_data);
                    apiSuccessResponse.sendResponse(res);
                }
            }

        } catch (err) {
            await logger("verifyOtp").log("error", `OTP Validation Error`, { "error": err });
            return next(
                new AppError('Your OTP is invalid', 400)
            );
        }

    } else {
        return next(
            new AppError('Invalid Request', 400)
        );
    }

});


const loginWithOtp = catchAsync(async (req, res, next) => {

    if (req.userInfo.msisdn === req.body.msisdn) {

        try {

            let otp = await validateOTP(req.body.msisdn, req.body.otp);

            if (otp) {
                const customer = await Customer.findOne({
                    where: { phone: req.body.msisdn }
                });

                if (customer === null) {

                    return next(
                        new AppError('Invalid Request', 400)
                    );

                } else {

                    const {
                        accessToken,
                        newRefreshToken
                    } = await generateTokens(customer.phone, customer.uid);

                    let return_data = {
                        token: {
                            token_type: "Bearer",
                            expires_in: config.jwtExpiration,
                            access_token: accessToken,
                            refresh_token: newRefreshToken
                        },
                        customer: {
                            name: customer.name ? customer.name : "",
                            uid: customer.uid,
                            msisdn: customer.phone,
                            //first_login_at: customer.first_login_at
                            has_logged_in: !!customer.first_login_at,
                            first_login_at: moment(customer.first_login_at).format("YYYY-MM-DD HH:mm:ss"),
                        }
                    }

                    let apiSuccessResponse = new ApiSuccessResponse("OTP Successfully Verified", 200, return_data);
                    apiSuccessResponse.sendResponse(res);

                }
            }

        } catch (sequelize_err) {

            await logger("verifyOtp").log("error", `OTP Validation Error`, { "error": sequelize_err });

            if (sequelize_err.name === "SequelizeConnectionError") {
                console.error('Error connecting to database:', sequelize_err);
            } else if (sequelize_err.name === "SequelizeValidationError") {
                console.error('Validation error:', sequelize_err);
            } else if (sequelize_err.name === "SequelizeForeignKeyConstraintError") {
                console.error('Foreign key constraint error:', sequelize_err);
            } else if (sequelize_err.name === "SequelizeUniqueConstraintError") {
                console.error('Unique constraint error:', sequelize_err);
            } else {
                console.error('Unknown error:', sequelize_err);
            }

            return next(
                new AppError('Could not validate OTP', 400)
            );
        }

    } else {
        return next(
            new AppError('Invalid Request', 400)
        );
    }


});


const loginWithPin = catchAsync(async (req, res, next) => {

    try {

        const msisdn = req.body.msisdn;
        const shera_id = req.body.shera_id;

        let whereClause = {
            is_soft_deleted: false
        };

        if (msisdn !== undefined) {
            whereClause.phone = msisdn;
        } else if (shera_id !== undefined) {
            whereClause.username = shera_id;
        }
        const customer = await Customer.findOne({
            where: whereClause,
            include: [{ model: Company, as: 'company' }]
        });

        // changes made for login with both msisdn and shera ID
        /*const customer = await Customer.findOne({
            where:
            {
                [Op.or]: [
                    { phone: req.body.msisdn },
                    { username: req.body.msisdn },
                ],
                is_soft_deleted: false,
            },
            include: [{ model: Company, as: 'company' }]
        });*/

        if (customer === null) {
            return next(
                new AppError('User does not exist', 400)
            );

        } else {

            /*let customer = {
                //first_login_at: Sequelize.literal('CURRENT_TIMESTAMP'),
                first_login_at: customer.first_login_at === null ?
                    moment().format('YYYY-MM-DD HH:mm:ss') :
                    customer.first_login_at,
                last_login_at: moment().format('YYYY-MM-DD HH:mm:ss'),
            }
            const createdUser = await Customer.create(customer);
            */

            const pinMatches = await bcrypt.compare(req.body.pin, customer.pin);

            if (pinMatches) {

                customer.set({
                    first_login_at: customer.first_login_at === null ?
                        moment().format('YYYY-MM-DD HH:mm:ss') :
                        customer.first_login_at,
                    last_login_at: moment().format('YYYY-MM-DD HH:mm:ss'),
                });

                await customer.save();

                const {
                    accessToken,
                    newRefreshToken
                } = await generateTokens(customer.phone, customer.uid);

                let return_data = {
                    token: {
                        token_type: "Bearer",
                        expires_in: config.jwtExpiration,
                        access_token: accessToken,
                        refresh_token: newRefreshToken
                    },
                    customer: {
                        name: customer.name ? customer.name : "",
                        gender: customer.gender ? customer.gender : "",
                        uid: customer.uid,
                        msisdn: customer.phone,
                        company_id: customer?.company?.id,
                        company_name: customer?.company?.company_name,
                        emp_id: customer.emp_id ? customer.emp_id : "",
                        //first_login_at: customer.first_login_at
                        has_logged_in: !!customer.first_login_at,
                        first_login_at: moment(customer.first_login_at).format("YYYY-MM-DD HH:mm:ss"),
                        is_hr_verified: customer.is_hr_verified
                    }
                }

                let apiSuccessResponse = new ApiSuccessResponse("Logged in successfully", 200, return_data);
                apiSuccessResponse.sendResponse(res);
            } else {
                return next(
                    new AppError('Invalid PIN', 401)
                );
            }

        }

    } catch (sequelize_err) {

        await logger("login-with-pin").log("error", `Login with PIN Error`, { "error": sequelize_err });

        if (sequelize_err.name === "SequelizeConnectionError") {
            console.error('Error connecting to database:', sequelize_err);
        } else if (sequelize_err.name === "SequelizeValidationError") {
            console.error('Validation error:', sequelize_err);
        } else if (sequelize_err.name === "SequelizeForeignKeyConstraintError") {
            console.error('Foreign key constraint error:', sequelize_err);
        } else if (sequelize_err.name === "SequelizeUniqueConstraintError") {
            console.error('Unique constraint error:', sequelize_err);
        } else {
            console.error('Unknown error:', sequelize_err);
        }

        return next(
            new AppError('Something went wrong while trying to log you in', 400)
        );
    }

});


const verifyOtpTest = async (req, res, next) => {

    if (req.userInfo.msisdn === req.body.msisdn) {
        console.log(req.userInfo)
        try {

            const customer = await Customer.findOne({
                where: { phone: req.body.msisdn }
            });

            let oneTimeAccessToken = generateOneTimeAccessToken(req.body.msisdn);


            if (customer === null) {

                let return_data = {
                    validation_time: otpConfig.validityInSeconds,
                    one_time_token: oneTimeAccessToken,
                    msisdn: req.body.msisdn,
                    has_logged_in: false
                }

                let apiSuccessResponse = new ApiSuccessResponse("OTP Successfully Verified", 200, return_data);
                apiSuccessResponse.sendResponse(res);

            } else {

                let return_data = {
                    validation_time: otpConfig.validityInSeconds,
                    one_time_token: oneTimeAccessToken,
                    name: customer.name ? customer.name : "",
                    uid: customer.uid,
                    msisdn: customer.phone,
                    has_logged_in: !!customer.first_login_at,
                    first_login_at: moment(customer.first_login_at).format("YYYY-MM-DD HH:mm:ss"),
                }

                let apiSuccessResponse = new ApiSuccessResponse("OTP Successfully Verified", 200, return_data);
                apiSuccessResponse.sendResponse(res);
            }

        } catch (sequelize_err) {

            await logger("verifyOtp").log("error", `OTP Validation Error`, { "error": sequelize_err });

            if (sequelize_err.name === "SequelizeConnectionError") {
                console.error('Error connecting to database:', sequelize_err);
            } else if (sequelize_err.name === "SequelizeValidationError") {
                console.error('Validation error:', sequelize_err);
            } else if (sequelize_err.name === "SequelizeForeignKeyConstraintError") {
                console.error('Foreign key constraint error:', sequelize_err);
            } else if (sequelize_err.name === "SequelizeUniqueConstraintError") {
                console.error('Unique constraint error:', sequelize_err);
            } else {
                console.error('Unknown error:', sequelize_err);
            }

            return next(
                new AppError('Could not validate OTP', 400)
            );
        }

    } else {
        return next(
            new AppError('Invalid Request', 400)
        );
    }

}


const setPin = catchAsync(async (req, res, next) => {

    if (req.userInfo.msisdn) {

        try {
            const customer = await Customer.findOne({
                where: { phone: req.userInfo.msisdn }
            });

            if (customer === null) {

                console.log('Customer Not found! Creating new customer....');

                /*let userFromHrDB = await HrData.findOne({
                    where: {
                        company_id: req.body.company_id,
                        emp_id: req.body.emp_id
                    }
                });

                if (userFromHrDB === null) {
                    userFromHrDB = await HrData.findOne({
                        where: {
                            company_id: req.body.company_id,
                            phone: req.userInfo.msisdn
                        }
                    });

                    if (userFromHrDB === null) {
                        /!*userFromHrDB = await HrData.findOne({
                            where: {
                                company_id: req.body.company_id,
                                name: req.body.name
                            }
                        });*!/

                        userFromHrDB = await HrData.findOne({
                            where: {
                                company_id: req.body.company_id,
                                [Op.and]: [
                                    Sequelize.where(
                                        Sequelize.fn('LOWER', Sequelize.col('name')),
                                        Sequelize.fn('LOWER', req.body.name)
                                    ),
                                ],
                            },
                        });

                    }
                }
                let is_hr_verified = 0;
                if (userFromHrDB !== null) {
                    is_hr_verified = 1;
                }
                */

                // change in logic according to new requirement
                let is_hr_verified = 0;
                let usersFromHrDB = await HrData.findAll({
                    where: {
                        company_id: req.body.company_id,
                        emp_id: req.body.emp_id
                    }
                });


                if (usersFromHrDB.length > 1) {
                    // There are more than one rows matching the criteria
                    usersFromHrDB.forEach((userRow) => {
                        if (
                            userRow['phone'].toString() === req.userInfo.msisdn.toString() ||
                            userRow['name'].toLowerCase() === req.body.name.toLowerCase()
                        ) {
                            is_hr_verified = 1;
                        }
                    });

                } else if (usersFromHrDB.length === 1) {
                    // There is exactly one row matching the criteria
                    is_hr_verified = 1;
                } else {
                    is_hr_verified = 0;
                }

                let customer = {
                    uid: uuidv4(),
                    phone: req.userInfo.msisdn,
                    //first_login_at: Sequelize.literal('CURRENT_TIMESTAMP'),
                    pin: await bcrypt.hash(req.body.pin, 10),
                    company_id: req.body.company_id,
                    name: req.body.name,
                    emp_id: req.body.emp_id,
                    gender: req.body.gender,
                    is_hr_verified: is_hr_verified
                }


                const createdUser = await Customer.create(customer);

                //get company if required like below
                //console.log(await createdUser.getCompany());

                if (createdUser) {
                    let return_data = {
                        customer: {
                            uid: createdUser.uid,
                            msisdn: createdUser.phone,
                            name: createdUser.name,
                            has_logged_in: false,
                            company_id: createdUser.company_id,
                            emp_id: createdUser.emp_id,
                            gender: createdUser.gender,
                            is_hr_verified: createdUser.is_hr_verified,
                            username: createdUser.username
                        }
                    }

                    const uniqueId = uuidv4().replace(/-/g, '').slice(0, 20);

                    sendSmsWithUsername(req.userInfo.msisdn, createdUser.username, uniqueId).then(() => {

                    }).catch(err => {
                        console.error('SMS sending failed for Username:', err);
                    });

                    let apiSuccessResponse = new ApiSuccessResponse("PIN has been set successfully", 200, return_data);
                    apiSuccessResponse.sendResponse(res);
                }

            } else {
                return next(
                    new AppError('You have already set your PIN once', 400)
                );
            }

        } catch (sequelize_err) {

            await logger("set-pin").log("error", `Error while setting pin`, { "error": sequelize_err });

            if (sequelize_err.name === "SequelizeConnectionError") {
                console.error('Error connecting to database:', sequelize_err);
            } else if (sequelize_err.name === "SequelizeValidationError") {
                console.error('Validation error:', sequelize_err);
            } else if (sequelize_err.name === "SequelizeForeignKeyConstraintError") {
                console.error('Foreign key constraint error:', sequelize_err);
            } else if (sequelize_err.name === "SequelizeUniqueConstraintError") {
                console.error('Unique constraint error:', sequelize_err);
            } else {
                console.error('Unknown error:', sequelize_err);
            }

            return next(
                new AppError('Could not validate PIN', 400)
            );
        }

    } else {
        return next(
            new AppError('Invalid Request', 400)
        );
    }


});


const logout = async (req, res, next) => {
    const { uid, msisdn } = req.userInfo;
    try {
        if (typeof user_type === 'string' && user_type === 'as-user') {
            let redisKey = "access:" + uid;
            const result = await redis.del(redisKey);
            if (result === 0) {
                console.log('Access token for this user does not exist in redis');
            } else {
                console.log('Access token for this user has been deleted from redis:', result);
            }
        } else {
            let redisKey = msisdn;
            const result = await redis.del(redisKey);
            if (result === 0) {
                console.log('Access token for this user does not exist in redis');
            } else {
                console.log('Access token for this user has been deleted from redis:', result);
            }
        }

    } catch (err) {
        console.log("could not delete access token from redis for logout");
        console.log(err);
    }
    try {
        RefreshToken.destroy({
            where: { uid: uid, msisdn: msisdn }
        });

        let apiSuccessResponse = new ApiSuccessResponse("Logged out successfully", 200);
        apiSuccessResponse.sendResponse(res);

    } catch (db_err) {
        console.log("could not delete refresh token from DB for logout");
        console.log(db_err);
    }
}


const getNewToken = async (req, res, next) => {
    const { uid, msisdn, user_type, companies } = req.userInfo;
    const requestToken = req.refreshToken;
    let return_data = {}

    try {
        let refreshToken = await RefreshToken.findOne({
            where: { token: requestToken, uid: uid }
        });
        if (!refreshToken) {
            return next(
                new AppError('Invalid token. Please log in again!', 401)
            );
        }

        if (RefreshToken.verifyExpiration(refreshToken)) {
            await RefreshToken.destroy({where: {id: refreshToken.id}});
            return next(
                new AppError('Your token has expired. Please log in again', 401)
            );
        }
        if (typeof user_type === 'string' && user_type === 'as-user') {
            const { accessToken, newRefreshToken } = await generateTokens(msisdn, uid, user_type);
            return_data = {
                token: {
                    token_type: "Bearer",
                    expires_in: config.jwtExpiration,
                    access_token: accessToken,
                    refresh_token: newRefreshToken
                },
                customer: {
                    uid: uid,
                    msisdn: msisdn,
                }
            }
        } else {
            const { accessToken, newRefreshToken } = await generateTokensAdmin(msisdn, uid, user_type, companies);
            return_data = {
                token: {
                    token_type: "Bearer",
                    expires_in: config.jwtExpiration,
                    access_token: accessToken,
                    refresh_token: newRefreshToken
                },
                customer: {
                    uid: uid,
                    msisdn: msisdn,
                }
            }
        }


        /*let return_data = {
            token: {
                token_type: "Bearer",
                expires_in: config.jwtExpiration,
                access_token: accessToken,
                refresh_token: newRefreshToken
            },
            customer: {
                uid: uid,
                msisdn: msisdn,
            }
        }*/

        let apiSuccessResponse = new ApiSuccessResponse("New tokens generated successfully", 200, return_data);
        apiSuccessResponse.sendResponse(res);

    } catch (err) {
        await logger("misc").log("error", `Could not save/generate token: ${req.method} ${req.url}`, { "error": err });

        return next(
            new AppError('Something went wrong while getting or storing tokens', 500)
        );
    }
};


const adminLogin = catchAsync(async (req, res, next) => {

    try {

        const adminUser = await AdminUser.findOne({
            where: { username: req.body.username },
            include: [
                { model: Company, attributes: ['id', 'company_name'] },
                { model: AdminRole, attributes: ['id', 'name', 'slug'] }
            ],
            attributes: ['id', 'username', 'name', 'password']
        });
        
        if (adminUser === null) {
            return next(
                new AppError('User does not exist', 400)
            );

        } else {
            const company_details = adminUser.companies.map(company => ({
                id: company.id,
                company_name: company.company_name
            }));

            const companyIds = company_details.map(company => company.id);

            const adminRoles = adminUser.admin_roles.map(adminRole => ({
                //id: adminRole.id,
                name: adminRole.name,
                slug: adminRole.slug,
            }));

            const roles = adminRoles.map(role => role.slug);

            // Check if there is an adminRole with slug "bp_order"
            /*const hasBpOrderRole = adminUser.admin_roles.some(adminRole => adminRole.slug === "bp_order");

            if (!hasBpOrderRole) {
                throw new Error('Required admin role "bp_order" not found.');
            }*/

            // Filter roles to find those with slug "bp_order"
            /*const bpOrderRoles = adminUser.admin_roles.filter(adminRole => adminRole.slug === "bp_order");

            if (bpOrderRoles.length === 0) {
                throw new Error('Required admin role "bp_order" not found.');
            }*/


            // console.log(adminRoles[0].slug)

            // const role = await AdminRole.findOne({ where: { id: adminUser.id },attributes:['id','name','slug'] })

            const passwordMatches = await bcrypt.compare(req.body.password, adminUser.password.replace(/^\$2y\$/, '$2a$'));
            if (passwordMatches) {
                const {
                    accessToken,
                    newRefreshToken
                } = await generateTokensAdmin(adminUser.username, uuidv4(), roles, companyIds);

                let return_data = {
                    token: {
                        token_type: "Bearer",
                        expires_in: config.jwtExpiration,
                        access_token: accessToken,
                        refresh_token: newRefreshToken
                    },
                    customer: {
                        name: adminUser.name ? adminUser.name : "",
                        username: adminUser.username,
                        company_details,
                        roles: roles
                    }
                }

                let apiSuccessResponse = new ApiSuccessResponse("Successful login", 200, return_data);
                apiSuccessResponse.sendResponse(res);
            } else {
                return next(
                    new AppError('Invalid Credentials', 401)
                );
            }

        }

    } catch (sequelize_err) {

        console.log(sequelize_err);

        await logger("bp-login").log("error", `BP Login Error`, { "error": sequelize_err });

        if (sequelize_err.name === "SequelizeConnectionError") {
            console.error('Error connecting to database:', sequelize_err);
        } else if (sequelize_err.name === "SequelizeValidationError") {
            console.error('Validation error:', sequelize_err);
        } else if (sequelize_err.name === "SequelizeForeignKeyConstraintError") {
            console.error('Foreign key constraint error:', sequelize_err);
        } else if (sequelize_err.name === "SequelizeUniqueConstraintError") {
            console.error('Unique constraint error:', sequelize_err);
        } else {
            console.error('Unknown error:', sequelize_err);
        }

        return next(
            new AppError('Something went wrong while trying to log you in', 400)
        );
    }

});




const fulfillmentLogin = catchAsync(async (req, res, next) => {

    try {

        const adminUser = await AdminUser.findOne({
            where: { username: req.body.username },
            include: [
                { model: Company, attributes: ['id', 'company_name'] },
                { model: AdminRole, attributes: ['id', 'name', 'slug'] }
            ],
            attributes: ['id', 'username', 'name', 'password']
        });

        if (adminUser === null) {
            return next(
                new AppError('User does not exist', 400)
            );

        } else {
            const company_details = adminUser.companies.map(company => ({
                id: company.id,
                company_name: company.company_name
            }));

            const companyIds = company_details.map(company => company.id);

            const adminRoles = adminUser.admin_roles.map(adminRole => ({
                //id: adminRole.id,
                name: adminRole.name,
                slug: adminRole.slug,
            }));

            const roles = adminRoles.map(role => role.slug);

            // Check if there is an adminRole with slug "bp_order"
            const hasBpOrderRole = adminUser.admin_roles.some(adminRole =>
                adminRole.slug === "bp_delivery" || adminRole.slug === "bp_leader" || adminRole.slug === "administrator"
            );

            if (!hasBpOrderRole) {
                return next(
                    new AppError("You don't have permission to access this route" , 401)
                );
            }

            // Filter roles to find those with slug "bp_order"
            /*const bpOrderRoles = adminUser.admin_roles.filter(adminRole => adminRole.slug === "bp_order");

            if (bpOrderRoles.length === 0) {
                throw new Error('Required admin role "bp_order" not found.');
            }*/


            // console.log(adminRoles[0].slug)

            // const role = await AdminRole.findOne({ where: { id: adminUser.id },attributes:['id','name','slug'] })

            const passwordMatches = await bcrypt.compare(req.body.password, adminUser.password.replace(/^\$2y\$/, '$2a$'));
            if (passwordMatches) {
                const {
                    accessToken,
                    newRefreshToken
                } = await generateTokensAdmin(adminUser.username, uuidv4(), roles, companyIds);

                let return_data = {
                    token: {
                        token_type: "Bearer",
                        expires_in: config.jwtExpiration,
                        access_token: accessToken,
                        refresh_token: newRefreshToken
                    },
                    customer: {
                        name: adminUser.name ? adminUser.name : "",
                        username: adminUser.username,
                        company_details,
                        roles: roles
                    }
                }

                let apiSuccessResponse = new ApiSuccessResponse("Successful login", 200, return_data);
                apiSuccessResponse.sendResponse(res);
            } else {
                return next(
                    new AppError('Invalid Credentials', 401)
                );
            }

        }

    } catch (sequelize_err) {

        console.log(sequelize_err);

        await logger("bp-login").log("error", `BP Login Error`, { "error": sequelize_err });

        if (sequelize_err.name === "SequelizeConnectionError") {
            console.error('Error connecting to database:', sequelize_err);
        } else if (sequelize_err.name === "SequelizeValidationError") {
            console.error('Validation error:', sequelize_err);
        } else if (sequelize_err.name === "SequelizeForeignKeyConstraintError") {
            console.error('Foreign key constraint error:', sequelize_err);
        } else if (sequelize_err.name === "SequelizeUniqueConstraintError") {
            console.error('Unique constraint error:', sequelize_err);
        } else {
            console.error('Unknown error:', sequelize_err);
        }

        return next(
            new AppError('Something went wrong while trying to log you in', 400)
        );
    }

});





const getOwnSecretForTesting = (req, res) => {
    const secret = process.env.OWN_HASH_SECRET;
    const hash = createHmac('sha256', secret)
        .update(`${process.env.OWN_HASH_KEY}${req.body.timestamp}`)
        .digest('hex');

    let apiSuccessResponse = new ApiSuccessResponse("Own Secret Successfully Generated", 200, { token: hash });
    apiSuccessResponse.sendResponse(res);

}


module.exports = {
    generateTokens,
    sendOtp,
    sendOtpTest,
    verifyOtp,
    loginWithOtp,
    getNewToken,
    getOwnSecretForTesting,
    verifyOtpTest,
    logout,
    setPin,
    loginWithPin,
    adminLogin,
    fulfillmentLogin
};

