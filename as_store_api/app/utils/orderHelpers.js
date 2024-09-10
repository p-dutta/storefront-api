const db = require("../models/sequelize");
const Order = db.orders;
const OrderItem = db.order_items;
const Product = db.products;
const Customer = db.customer;
const Company = db.company;
const AdminUser = db.adminUser;
const DeliveryCampaign = db.deliveryCampaign;
const commonConfig = require("../../config/common.config.js");

const {Op} = require("sequelize");
const {getCampaignByCompany} = require("./campaignHelpers");

const getOrdersByFilters = async (companyIds, query_params) => {

    const filters = {};
    const customer_filters = {};
    const { order_no, shera_id, customer_phone, worker_id, name, status, page = 1, limit = 10 } = query_params;

    let {campaignId, campaignName, campaignStartTime} = await getCampaignByCompany(companyIds);

    if (order_no) filters['order_no'] = { [Op.like]: `%${order_no}%` };
    if (name) customer_filters['name'] = { [Op.iLike]: `%${name}%` };
    if (customer_phone) customer_filters['phone'] = { [Op.like]: `%${customer_phone}%` };
    if (shera_id) customer_filters['username'] = { [Op.like]: `%${shera_id}%` };
    if (worker_id) customer_filters['emp_id'] = { [Op.like]: `%${worker_id}%` };

    if (status) {
        if (status === 'delivered') {
            filters['is_paid'] = true;
            filters['is_delivered'] = true;
            filters['is_canceled'] = false;
        } else if (status === 'pending') {
            filters['is_paid'] = false;
            filters['is_delivered'] = false;
            filters['is_canceled'] = false;
        } else if (status === 'canceled') {
            filters['is_canceled'] = true;
        }
    }

    const offset = (page - 1) * limit;


    // If campaignId is null, return default configuration
    // that is, last 30 days' orders against assigned companies
    // otherwise, just return orders by campaignId

    const whereClause = campaignId ?
        { delivery_campaign_id: campaignId,
            ...filters
        } :
        {
            created_at: {
                [Op.gte]: campaignStartTime,
            },
            company_id: {
                [Op.in]: companyIds,
            },
            ...filters,
        };

    const totalOrders = await Order.count({
        // subQuery: false,
        where: whereClause,
        include: [
            {
                model: Customer,
                as: 'customer',
                where: {
                    ...customer_filters
                },
                attributes: ['name', 'username', 'phone']
            }
        ]
    });

    // const totalOrders = 100

    const orders = await Order.findAll({
        //subQuery: false,
        where: whereClause,
        include: [
            {
                model: OrderItem,
                as: 'order_items',
                include: [
                    {
                        model: Product,
                        as: 'product',
                        attributes: ['name', 'price', 'mrp', 'unit', 'packaging', 'unit_amount']
                    }
                ],
                attributes: ['id', 'quantity', 'total_price']
            },
            {
                model: Customer,
                as: 'customer',
                where: {
                    ...customer_filters
                },
                attributes: ['name', 'username', 'phone', 'emp_id']
            }
        ],
        attributes: ['id', 'order_no', 'total_price', 'created_at', 'is_paid', 'delivery_campaign_id'],
        order: [['created_at', 'DESC']],
        limit: limit,
        offset: offset
    });

    let pages = Math.ceil(totalOrders / limit)

    return {totalOrders, pages, page, orders, campaignName, campaignStartTime};

};



module.exports = {
    getOrdersByFilters
};
