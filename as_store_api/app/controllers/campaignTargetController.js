const db = require("../models/sequelize");
//const AdminUser = db.adminUser;
const AppError = require("../utils/appError");
const {getCampaignTargetData} = require("../utils/campaignHelpers");
const ApiSuccessResponse = require("../utils/successfulApiResponse");
const moment = require("moment/moment");

const getCampaignTargetMetrics = async (req, res, next) => {

    try {
        const { companies: companyIds, msisdn: username } = req.userInfo

        if (!companyIds || companyIds.length === 0) {
            return next(
                new AppError('No company assigned against this user', 403)
            );
        }

        /*const adminUser = await AdminUser.findOne({
            where: { username: username },
            attributes: ['id', 'username']
        });

        if (adminUser === null) {
            return next(
                new AppError('User does not exist', 400)
            );
        }*/

        const {
            campaignName, campaignStartTime, totalOrders, fulfilledOrders,
            targetOrders, targetFulfillmentPercentage, achievedOrderPercentage,
            achievedFulfillmentPercentage
        } = await getCampaignTargetData(username, companyIds);

        /*const {
            campaignName, campaignStartTime, totalOrders, fulfilledOrders,
            targetOrders, targetFulfillmentPercentage, achievedOrderPercentage,
            achievedFulfillmentPercentage
        } = await getCampaignTargetData(username, companyIds)*/

        let return_data = {
            campaign_name: campaignName,
            campaign_start_time: moment(campaignStartTime).format("YYYY-MM-DD HH:mm:ss"),
            total_orders: totalOrders,
            fulfilled_orders: fulfilledOrders,
            target_orders: targetOrders,
            target_fulfillment_percentage: targetFulfillmentPercentage,
            achieved_order_percentage: achievedOrderPercentage,
            achieved_fulfillment_percentage: achievedFulfillmentPercentage,
        };
        let apiSuccessResponse = new ApiSuccessResponse("Campaign Target Metrics", 200, return_data);
        apiSuccessResponse.sendResponse(res);
    } catch (error) {
        console.log(error);
        return next(
            new AppError('Something went wrong while fetching metrics', 400)
        );

    }



}


module.exports = {getCampaignTargetMetrics};
