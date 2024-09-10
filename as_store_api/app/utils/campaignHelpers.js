const db = require("../models/sequelize");
const Order = db.orders;
const DeliveryCampaign = db.deliveryCampaign;
const DeliveryCampaignTarget = db.deliveryCampaignTarget;
const commonConfig = require("../../config/common.config.js");
const { Op, fn, col, literal } = require('sequelize');
const moment = require("moment");


const getCampaignByCompany = async (companyIds) => {

    const now = moment().toDate();
    // Fetch the latest active campaign
    const activeCampaigns = await DeliveryCampaign.findAll({
        where: {
            active_status: true,
            deleted_at: null,
            [Op.or]: [
                { company_id: {[Op.in]: companyIds}},
                { company_id: 0 }
            ],
            /*company_id: {
                [Op.in]: companyIds
            },*/

            start_time: {
                [Op.lte]: now, // Less than or equal to the current date
            },
            end_time: {
                [Op.gte]: now, // Greater than or equal to the current date
            }
        },

        order: [['start_time', 'DESC']]
    });


    let campaignStartTime = null;
    let campaignId = null;
    let campaignName = "Default Campaign";

    if (activeCampaigns.length === 0) {
        campaignStartTime = new Date(); //current date
        campaignStartTime.setDate(campaignStartTime.getDate() - commonConfig.orderDays);
    } else {
        for (const campaign of activeCampaigns) {
            campaignId = campaign.id;
            campaignName = campaign.name;
            campaignStartTime = campaign.start_time;

            if (campaign.company_id !== 0) {
                break;
            }
        }
    }

    return {campaignId, campaignName, campaignStartTime};

};

const getCampaignTargetData = async (adminUserName, companyIds) => {

    let {campaignId, campaignName, campaignStartTime} = await getCampaignByCompany(companyIds);

    const campaignTarget = await DeliveryCampaignTarget.findOne({
        where: {
            active_status: true,
            bp_username: adminUserName,
            campaign_id: campaignId,
            deleted_at: null
        },
        order: [['created_at', 'DESC']],
        attributes: ['target', 'fulfilment_percentage', 'd_company_id']
    });

    const whereClause = campaignId ?
        {
            delivery_campaign_id: campaignId,
            assisted_by: adminUserName
        }
        : {
            created_at: {
                [Op.gte]: campaignStartTime,
            },
            assisted_by: adminUserName
        };

    const orderCounts = await Order.findOne({
        where: whereClause,
        attributes: [
            [fn('COUNT', col('id')), 'total_orders'],
            [fn('COALESCE', literal(`SUM(CASE WHEN "is_paid" = true AND "is_delivered" = true THEN 1 ELSE 0 END)`), 0), 'delivered_orders'],
        ],
        raw: true, // Use raw output if you prefer plain objects
    });

    const totalOrders = orderCounts.total_orders;
    const fulfilledOrders = orderCounts.delivered_orders;
    const targetOrders = campaignTarget.target.toString();
    const targetFulfillmentPercentage = campaignTarget.fulfilment_percentage;
    const achievedOrderPercentage = ((totalOrders / targetOrders) * 100).toFixed(2);
    const achievedFulfillmentPercentage = ((fulfilledOrders / targetOrders) * 100).toFixed(2);

    return {
        campaignName, campaignStartTime, totalOrders, fulfilledOrders, targetOrders, targetFulfillmentPercentage,
        achievedOrderPercentage, achievedFulfillmentPercentage
    }

};




module.exports = {
    getCampaignTargetData, getCampaignByCompany
};