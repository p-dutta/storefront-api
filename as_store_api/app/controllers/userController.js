const db = require("../models/sequelize");
const Customer = db.customer;
const Company = db.company;
const Campaign = db.campaign;
const {v4: uuidv4} = require('uuid');
const ApiSuccessResponse = require("../utils/successfulApiResponse");
const AppError = require("../utils/appError");
const moment = require('moment');
const logger = require("../utils/logger");
const {Op} = require("sequelize");


const customerBasicInfo = async (req, res, next) => {
    const {uid, msisdn} = req.userInfo;

    try {
        const customer = await Customer.findOne({
            where: {phone: msisdn},
            // include: Company
        });

        if (!customer) {
            return next(
                new AppError('User not found', 404)
            );
        }

        let return_data = {
            name: customer.name ? customer.name : "",
            gender: customer.gender ? customer.gender : "",
            uid: customer.uid,
            msisdn: customer.phone,
            company_id: customer?.company?.id,
            company_name: customer?.company?.company_name,
            emp_id: customer.emp_id ? customer.emp_id : "",
            //first_login_at: customer.first_login_at
            has_logged_in: !!customer.first_login_at,
            first_login_at: moment(customer.first_login_at).format("YYYY-MM-DD HH:mm:ss")
        }



        let apiSuccessResponse = new ApiSuccessResponse("Customer Basic Info.", 200, return_data);
        apiSuccessResponse.sendResponse(res);


    } catch (sequelize_err) {

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
            new AppError('Something went wrong: ', 404)
        );
    }
};

const deleteSelf = async (req, res, next) => {
    const {uid, msisdn} = req.userInfo;

    try {
        const customer = await Customer.findOne({
            where: {phone: msisdn}
        });

        if (!customer) {
            return next(
                new AppError('User not found', 404)
            );
        }

        await customer.destroy();

        let apiSuccessResponse = new ApiSuccessResponse("Customer successfully deleted", 200, {msisdn});
        apiSuccessResponse.sendResponse(res);


    } catch (sequelize_err) {

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
            new AppError('Something went wrong: ', 404)
        );
    }
};

const isEligibleForFirstOrder = async (req, res, next) => {
    const {uid, msisdn} = req.userInfo;
    try {
        const now = moment().toDate();
        const firstOrderCampaign = await Campaign.findOne({
            where: {
                status: 1,
                campaign_type: "first_order",
                start_date: {
                    [Op.lte]: now, // Less than or equal to the current date
                },
                end_date: {
                    [Op.gte]: now, // Greater than or equal to the current date
                }},
        });

        if(firstOrderCampaign) {
            const customer = await Customer.findOne({
                where: {phone: msisdn, first_order: 0},
                // include: Company
            });

            if (!customer) {
                let apiSuccessResponse = new ApiSuccessResponse("Not eligible", 204);
                apiSuccessResponse.sendResponse(res);
            } else {
                let return_data = {
                    name: firstOrderCampaign.name,
                    campaign_type: firstOrderCampaign.campaign_type,
                    slug: firstOrderCampaign.slug,
                    discount_type: firstOrderCampaign.discount_type,
                    discount_value: firstOrderCampaign.discount_value,
                    conditions: customer?.company?.company_name,
                }
                let apiSuccessResponse = new ApiSuccessResponse("Eligible for first order campaign", 200, return_data);
                apiSuccessResponse.sendResponse(res);
            }
        } else {
            let apiSuccessResponse = new ApiSuccessResponse("No such campaign running", 204);
            apiSuccessResponse.sendResponse(res);
        }

    } catch (sequelize_err) {

        await logger("misc").log("error", `Error while checking eligibility of first order`, { "error": sequelize_err });

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
            new AppError('Something went wrong: ', 404)
        );
    }
};



const searchUser = async (req, res, next) => {
    try {
        const { company_ids, search_string } = req.body;
        const customer = await Customer.findOne({
            include: [{ model: Company, as:'company', attributes: ['company_name'] }],
            attributes: ['id','email', 'phone', 'uid', 'name', 'emp_id', 'email', 'username', 'is_hr_verified', 'last_login_at', 'gender' ],
            where: {
                company_id: { [Op.in]: company_ids },
                [Op.or]: [
                    { phone: search_string },
                    { username: search_string },
                    { emp_id: search_string },
                ]
            }
        });
        if (!customer) {
            return next(
                new AppError('No customer found as per your input', 404)
            );
        }
        else {
            let apiSuccessResponse = new ApiSuccessResponse("Customer found", 200, customer);
            apiSuccessResponse.sendResponse(res);
        }
    } catch (error) {
        console.log(error)
        return next(
            new AppError('Something Wrong', 400)
        );
    }
}

const searchUserDynamic = async (req, res, next) => {
    try {
        const { company_ids, search_string } = req.body;
        const customer = await Customer.findOne({
            include: [{ model: Company, as:'company', attributes: ['company_name'] }],
            attributes: ['id','email', 'phone', 'uid', 'name', 'emp_id', 'email', 'username', 'is_hr_verified', 'last_login_at', 'gender' ],
            where: {
                company_id: { [Op.in]: company_ids },
                [Op.or]: [
                    { phone: { [Op.like]: `%${search_string}%` } },
                    { username: { [Op.like]: `%${search_string}%` } },
                    { emp_id: { [Op.like]: `%${search_string}%` } },
                    { name: { [Op.like]: `%${search_string}%` } },
                ]
            }
        });
        if (!customer) {
            return next(
                new AppError('No customer found as per your input', 404)
            );
        }
        else {
            let apiSuccessResponse = new ApiSuccessResponse("Customer found", 200, customer);
            apiSuccessResponse.sendResponse(res);
        }
    } catch (error) {
        console.log(error)
        return next(
            new AppError('Something Wrong', 400)
        );
    }
}



module.exports = {
    customerBasicInfo, deleteSelf, isEligibleForFirstOrder, searchUser, searchUserDynamic
};





