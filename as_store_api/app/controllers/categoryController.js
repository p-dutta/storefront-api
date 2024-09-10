const db = require('../models/sequelize');
const Category = db.category;
const Product = db.products;
const AppError = require("../utils/appError");
const ApiSuccessResponse = require("../utils/successfulApiResponse");

const createCategory = async (req, res, next) => {

    try {
        const createdCategory = await Category.create({ ...req.body });
        let apiSuccessResponse = new ApiSuccessResponse("Category created successfully", 200, createdCategory);
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
            return next(
                new AppError('Duplicate Category Error', 400)
            );
        } else {
            console.error('Unknown error:', sequelize_err);
        }

        return next(
            new AppError('Something went wrong: ', 404)
        );
    }
}

const getAllCategory = async (req, res, next) => {
    try {


        const categories = await Category.findAll({ include: [{ model: Product, as: 'product' }], where: { status: true } });
        if (!categories) {
            return next(
                new AppError('Category Not Found', 404)
            );

        }
        else {
            let apiSuccessResponse = new ApiSuccessResponse("All Products Categories", 200, categories);
            apiSuccessResponse.sendResponse(res);
        }
    } catch (error) {
        console.log(error)
        return next(
            new AppError('Something Wrong', 400)
        );
    }
}

const getCategory = async (req, res, next) => {
    try {

        const category = await Category.findOne({ where: { status: true, id: req.params.id } });
        if (!category) {
            return next(
                new AppError('Category Not Found', 404)
            );

        }
        else {
            let apiSuccessResponse = new ApiSuccessResponse("Product Category", 200, category);
            apiSuccessResponse.sendResponse(res);
        }
    } catch (error) {
        console.log(error)
        return next(
            new AppError('Something Wrong', 400)
        );
    }
}



module.exports = { createCategory, getAllCategory,getCategory }