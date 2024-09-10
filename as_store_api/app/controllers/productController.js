const db = require('../models/sequelize');
const Category = db.category;
const Product = db.products;
const AppError = require("../utils/appError");
const ApiSuccessResponse = require("../utils/successfulApiResponse");
const redis = require("../../redis");
const logger = require("../utils/logger");

const createProduct = async (req, res, next) => {

    try {
        const createdProduct = await Product.create({ ...req.body });
        let apiSuccessResponse = new ApiSuccessResponse("Product created successfully", 200, createdProduct);
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
                new AppError('Product must be unique', 400)
            );
        } else {
            console.error('Unknown error:', sequelize_err);
        }

        return next(
            new AppError('Something went wrong: ', 404)
        );
    }
}

const getAllProduct = async (req, res, next) => {

    /*try {
        const products = await Product.findAll({
            include: [{ model: Category, as:'category', attributes: ['name'] }],
            attributes: ['id','name', 'price', 'image_url', 'is_active','unit','priority','packaging', 'mrp', 'unit_amount', 'market_price'],
            where: { is_active: true },
            order:[['priority','ASC']],
        });
        if (!products) {
            return next(
                new AppError('No product found', 400)
            );
        } else {
            let apiSuccessResponse = new ApiSuccessResponse("All Product List", 200, products);
            apiSuccessResponse.sendResponse(res);
        }

    } catch (error) {
        console.log(error)
        return next(
            new AppError('Something went Wrong', 400)
        );
    }

*/

    try {
        let cachedProductList = await redis.get("all_products");

        if(!cachedProductList) {
            try {
                const products = await Product.findAll({
                    include: [{ model: Category, as:'category', attributes: ['name'] }],
                    attributes: ['id','name', 'price', 'image_url', 'is_active','unit','priority','packaging', 'mrp', 'unit_amount', 'market_price'],
                    where: { is_active: true },
                    order:[['priority','ASC']],
                });
                if (!products) {
                    return next(
                        new AppError('No product found', 400)
                    );
                } else {

                    try {
                        await redis.set("all_products", JSON.stringify(products), "EX", 3600);
                    } catch (redis_err) {

                        await logger("redis-error").log("error", `Could not save static product list to redis`, {"error": redis_err});

                        console.log(redis_err);
                    }

                    let apiSuccessResponse = new ApiSuccessResponse("All Product List", 200, products);
                    apiSuccessResponse.sendResponse(res);
                }
            } catch (error) {
                console.log(error)
                return next(
                    new AppError('Something went Wrong', 400)
                );
            }
        }

        let apiSuccessResponse = new ApiSuccessResponse("All Product List", 200, JSON.parse(cachedProductList));
        apiSuccessResponse.sendResponse(res);


    } catch (redis_error) {
        await logger("redis-error").log("error", `${req.method} ${req.url}`, {"error": redis_error});

        try {
            const products = await Product.findAll({
                include: [{ model: Category, as:'category', attributes: ['name'] }],
                attributes: ['id','name', 'price', 'image_url', 'is_active','unit','priority','packaging', 'mrp', 'unit_amount', 'market_price'],
                where: { is_active: true },
                order:[['priority','ASC']],
            });
            if (!products) {
                return next(
                    new AppError('No product found', 400)
                );
            } else {
                let apiSuccessResponse = new ApiSuccessResponse("All Product List", 200, products);
                apiSuccessResponse.sendResponse(res);
            }
        } catch (error) {
            console.log(error);
            return next(
                new AppError('Something went Wrong', 400)
            );
        }

    }
}
const getAllProductByCategory = async (req, res, next) => {
    try {

        const products = await Product.findAll({
            include: [{ model: Category, as:'category', attributes: ['name'] }],
            attributes: ['id','name', 'price', 'image_url', 'is_active'],
            where: { category_id: req.params.category_id }
        });
        if (!products) {
            return next(
                new AppError('Product Not found', 400)
            );
        }
        else {
            let apiSuccessResponse = new ApiSuccessResponse("All Products products", 200, products);
            apiSuccessResponse.sendResponse(res);
        }
    } catch (error) {
        console.log(error)
        return next(
            new AppError('Something Wrong', 400)
        );
    }
}


module.exports = { createProduct, getAllProduct,getAllProductByCategory }