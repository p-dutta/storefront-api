const db = require("../models/sequelize");
const Company = db.company;
const ApiSuccessResponse = require("../utils/successfulApiResponse");
const AppError = require("../utils/appError");



const getAllCompanies = async (req, res, next) => {

    try {
        let companies = await Company.findAll({
            where: {is_active: 1, deleted_at: null},
            attributes: ['id', 'company_name', 'company_address', 'company_poc_name', 'company_poc_contact'],
            order: [['company_name', 'ASC']]
        });

        if (!companies) {
            return next(
                new AppError('No company found', 404)
            );
        }

        let apiSuccessResponse = new ApiSuccessResponse("All Active Companies.", 200, companies);
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


module.exports = {getAllCompanies};





