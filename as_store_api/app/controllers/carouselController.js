const db = require("../models/sequelize");
const Carousel = db.carousel;
const redis = require("../../redis");
const AppError = require("../utils/appError");
const logger = require("../utils/logger");
const ApiSuccessResponse = require("../utils/successfulApiResponse");


const getAllCarousels = async (req, res, next) => {
    try {
        let cachedCarousels = await redis.get("carousel");

        if(!cachedCarousels) {
            try {
                let carousels = await Carousel.findAll({
                    attributes: ['image_url','app_location', 'priority', 'short_desc', 'icon', 'for_application'],
                    where: { status: true },
                    order:[['priority','DESC']],
                });
                if (!carousels) {
                    let apiSuccessResponse = new ApiSuccessResponse("No content", 200, []);
                    apiSuccessResponse.sendResponse(res);
                } else {
                    try {
                        await redis.set("carousel", JSON.stringify(carousels), "EX", 86400);
                    } catch (redis_err) {
                        await logger("redis-error").log("error", `Could not save carousel to redis`, {"error": redis_err});
                    }

                    let apiSuccessResponse = new ApiSuccessResponse("Carousels", 200, carousels);
                    apiSuccessResponse.sendResponse(res);
                }
            } catch (error) {
                await logger("misc").log("error", `Error from carousel controller`, {"error": error});
                return next(
                    new AppError('Something went Wrong', 400)
                );
            }
        }

        let apiSuccessResponse = new ApiSuccessResponse("Carousels", 200, JSON.parse(cachedCarousels));
        apiSuccessResponse.sendResponse(res);


    } catch (redis_error) {
        await logger("redis-error").log("error", `${req.method} ${req.url}`, {"error": redis_error});

        return next(
            new AppError('Something went Wrong', 400)
        );

    }
}


module.exports = {getAllCarousels};