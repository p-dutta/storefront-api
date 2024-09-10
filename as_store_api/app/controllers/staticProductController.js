const db = require("../../db");
const {StaticProduct} = db;
const ApiSuccessResponse = require("../utils/successfulApiResponse");
const AppError = require("../utils/appError");
const redis = require("../../redis");
const logger = require("../utils/logger");

const getAllStaticProducts = async (req, res, next) => {

    try {
        let staticProductList = await redis.get("static_product_list");

        if(!staticProductList) {

            try {
                // Fetch all products grouped by categories
                let staticProducts = await StaticProduct.findAll({
                    attributes: ['id', 'category', 'product_name', 'market_price', 'discounted_price', 'tags'],
                    where: {
                        is_active: 1,
                        deleted_at: null
                    },
                    order: [['category', 'ASC']],
                    raw: true // Get raw JSON data
                })

                const productsByCategory = staticProducts.reduce((result, product) => {
                    const category = product.category;
                    if (!result[category]) {
                        result[category] = [];
                    }
                    delete product.category; // Remove 'category' from the product
                    result[category].push(product);
                    return result;
                }, {})

                if (!productsByCategory) {
                    return next(
                        new AppError('No product found', 404)
                    );
                }

                try {
                    await redis.set("static_product_list", JSON.stringify(productsByCategory), "EX", 300);
                } catch (redis_err) {

                    await logger("redis-error").log("error", `Could not save static product list to redis`, {"error": redis_err});

                    console.log(redis_err);
                }


                let apiSuccessResponse = new ApiSuccessResponse("All Static Products.", 200, productsByCategory);
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

           

        }

        let apiSuccessResponse = new ApiSuccessResponse("All Static Products.", 200, JSON.parse(staticProductList));
        apiSuccessResponse.sendResponse(res);


    } catch (redis_error) {

        await logger("redis-error").log("error", `${req.method} ${req.url}`, {"error": redis_error});

        console.log("could not reach redis server...saving token to DB");
    }

};

module.exports = {getAllStaticProducts};





