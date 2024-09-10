const db = require('../models/sequelize');
const commonConfig = require("../../config/common.config.js");
const Order = db.orders;
const OrderItem = db.order_items;
const Product = db.products;
const Customer = db.customer;
const Campaign = db.campaign;
const AdminUser = db.adminUser;
const Company = db.company;
const AppError = require("../utils/appError");
const ApiSuccessResponse = require("../utils/successfulApiResponse");
const moment = require("moment/moment");
const {Op, fn, col, literal} = require("sequelize");
const logger = require("../utils/logger");
const {getOrdersByFilters} = require("../utils/orderHelpers");
const {getCampaignByCompany} = require("../utils/campaignHelpers");

const createOrder = async (req, res, next) => {
    try {
        const { orderItems, billing_address } = req.body;

        //get customer
        const customer = await Customer.findOne(
            { where: { uid: req.userInfo.uid } }
        );

        let {campaignId, campaignName, campaignStartTime} = await getCampaignByCompany([customer.company_id]);


        let order_items = [];

        const totalPricePromises = orderItems.map(async ({ product_id, qty, }) => {
            const product = await Product.findByPk(product_id)
            if (!product) {
                new AppError('Product Not Found ', 404)
            }

            const total_price = product.mrp * qty
            order_items.push({
                product_id: product.id, total_price, quantity: qty,unit_price:product.mrp, company_id:customer.company_id
            })
            return total_price
        })

        //[] = individual price * qty
        let totalPrices = await Promise.all(totalPricePromises)

        //final calculation
        let total_price = totalPrices.reduce((total, price) => total + price, 0);

        let discount_amount = 0.00;
        //add coupon discount
        // let coupon_discount = 25;
        // total_price = total_price - coupon_discount;

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
            if(customer.first_order == 0) {
                let discount_type = firstOrderCampaign.discount_type
                let discount_value = firstOrderCampaign.discount_value

                if(discount_type === "percentage") {
                    discount_amount = total_price*(discount_value/100)
                    discount_amount = parseFloat( discount_amount.toFixed(2) )
                    total_price = total_price - discount_amount
                } else if(discount_type === "fixed") {
                    discount_amount = discount_value
                    total_price = total_price - discount_amount
                }
            }
        }


        //create order
        const createdOrder = await Order.create({
            total_price:total_price, billing_address, customer_id: customer.id,
            company_id: customer.company_id, discount_amount: discount_amount,
            delivery_campaign_id: campaignId
        });

        //add order_id
        order_items = order_items.map(item => ({ ...item, order_id: createdOrder?.id, order_no: createdOrder?.order_no }))

        //create orderItems
        //bulkCreate -> allows to insert multiple records into a table in a single database query
        await OrderItem.bulkCreate(order_items);

        if(customer.first_order == 0) {
            customer.set({first_order: 1,});
            await customer.save();
        }

        let apiSuccessResponse = new ApiSuccessResponse("Order created successfully", 200, {
            total_price: createdOrder.total_price,
            discount_amount: createdOrder.discount_amount,
            ordered_at: createdOrder.created_at,
            payment_method: createdOrder.payment_method,
            billing_address: createdOrder.billing_address,
            ordered_items: order_items,
            campaignName,
            campaignStartTime
        });
        apiSuccessResponse.sendResponse(res);

        //clear cart - redis
        // await redis.del('cart_'+req.userInfo.uid )


    } catch (sequelize_err) {

        await logger("order-errors").log("error", `Error while placing order`, { "error": sequelize_err });

        if (sequelize_err.name === "SequelizeConnectionError") {
            console.error('Error connecting to database:', sequelize_err);
        } else if (sequelize_err.name === "SequelizeValidationError") {
            console.error('Validation error:', sequelize_err);
        } else if (sequelize_err.name === "SequelizeForeignKeyConstraintError") {
            console.error('Foreign key constraint error:', sequelize_err);
        } else if (sequelize_err.name === "SequelizeUniqueConstraintError") {
            console.error('Unique constraint error:', sequelize_err);
            return next(
                new AppError('Order must be unique', 400)
            );
        } else {
            console.error('Unknown error:', sequelize_err);
        }

        return next(
            new AppError('Something went wrong: ', 404)
        );
    }
}

const getAllOrder = async (req, res, next) => {
    try {
        //check if exist
        const orders = await Order.findAll({ include: [{ model: Customer, as: 'customer', attributes: ['name'] }], attributes: ['id', 'billing_address', 'total_price', 'is_paid', 'payment_method'] });
        // const Orders = await Orders.findAll({
        //     include: [{ model: Category, attributes: ['name'] }],
        //     attributes: ['name', 'price', 'image_url', 'is_active']
        // });
        if (!orders) {
            return next(
                new AppError('Order Not found', 400)
            );
        }
        else {
            let apiSuccessResponse = new ApiSuccessResponse("All Orders Orders", 200, orders);
            apiSuccessResponse.sendResponse(res);
        }
    } catch (error) {
        console.log(error)
        return next(
            new AppError('Something Wrong', 400)
        );
    }
}

const getOrder = async (req, res, next) => {
    try {

        //check if exist
        const order = await Order.findOne({ include: [{ model: Customer, as: 'customer', attributes: ['name', 'gender', 'email', 'phone'] }], where: { id: req.params.id }, attributes: ['id', 'billing_address', 'total_price', 'is_paid', 'payment_method'] });

        if (!order) {
            return next(
                new AppError('Order Not found', 400)
            );
        }
        else {
            let apiSuccessResponse = new ApiSuccessResponse("All Orders Orders", 200, order);
            apiSuccessResponse.sendResponse(res);
        }
    } catch (error) {
        console.log(error)
        return next(
            new AppError('Something Wrong', 400)
        );
    }
}

const getLatestOrder = async (req, res, next) => {
    try {

        const customer = await Customer.findOne( { where: { uid: req.userInfo.uid },attributes:['id','uid'] });

        //check if exist
        const order = customer && await Order.findOne({where: { customer_id: customer.id, }, order: [['id', 'DESC']], attributes: ['id', 'total_price', 'order_no'],order:[ ['created_at', 'DESC'],] });

        if (!order) {
            return next(
                new AppError('Order Not found', 400)
            );
        }
        else {

            const latestOrderId = order.id;

            //find order_items
            const orderItems = latestOrderId && await OrderItem.findAll({ include: [{ model: Product, as: 'product', attributes: ['name'] }], attributes: ['id', 'total_price', 'quantity'], where: { order_id: latestOrderId } });

            let apiSuccessResponse =  new ApiSuccessResponse("Order Details ", 200, {order_no:order.order_no, orderItems, grand_total: order.total_price });
            apiSuccessResponse.sendResponse(res);
        }
    } catch (error) {
        console.log(error)
        return next(
            new AppError('Something Wrong', 400)
        );
    }
}

const getOrderByCustomer = async (req, res, next) => {
    try {

        // scope of optimization. Put msisdn in orders table and skip the customer table query

        /*const order = await Order.findAll({
            where: { customer_id: req.params.customer_id },
            attributes: ['id', 'billing_address', 'total_price', 'is_paid', 'payment_method'],
            order: [['created_at', 'DESC']],
            limit: 10
        });*/


        const xDaysAgo = new Date();
        xDaysAgo.setDate(xDaysAgo.getDate() - commonConfig.orderDays);

        const customer = await Customer.findOne( {
            where: { uid: req.userInfo.uid },
            attributes:['id','uid']
        });

        const orders = await Order.findAll({
            where: {
                customer_id: customer.id,
                created_at: {
                    [Op.gte]: xDaysAgo
                },
            },
            order: [['created_at', 'DESC']],
            //limit: 10,
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
                }
            ],
            attributes: ['id', 'order_no', 'total_price', 'created_at', 'is_paid']
        });

        if (orders.length === 0) {
            return next(new AppError('No orders found', 404));
        } else {
            let apiSuccessResponse = new ApiSuccessResponse("Last 30 days' orders", 200, orders);
            apiSuccessResponse.sendResponse(res);
        }

    } catch (error) {
        console.log(error)
        return next(
            new AppError('Something Went Wrong', 400)
        );
    }
}


const createAssistedOrder = async (req, res, next) => {
    try {

        const { companies: companyIds } = req.userInfo

        if (!companyIds || companyIds.length === 0) {
            return next(
                new AppError('No company assigned against this user', 403)
            );
        }

        let {campaignId, campaignName, campaignStartTime} = await getCampaignByCompany(companyIds);

        const { orderItems, billing_address, uid } = req.body;

        //get customer
        const customer = await Customer.findOne(
            { where: { uid: uid } }
        );

        if (!customer) {
            return next(
                new AppError('User not found', 404)
            );
        }

        let order_items = [];

        const totalPricePromises = orderItems.map(async ({ product_id, qty, }) => {
            const product = await Product.findByPk(product_id)
            if (!product) {
                new AppError('Product Not Found', 404)
            }

            const total_price = product.mrp * qty
            order_items.push({
                product_id: product.id, total_price, quantity: qty,unit_price:product.mrp, company_id:customer.company_id
            })
            return total_price
        })

        //[] = individual price * qty
        let totalPrices = await Promise.all(totalPricePromises)

        //final calculation
        let total_price = totalPrices.reduce((total, price) => total + price, 0);

        let discount_amount = 0.00;
        //add coupon discount
        // let coupon_discount = 25;
        // total_price = total_price - coupon_discount;

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
            if(customer.first_order == 0) {
                let discount_type = firstOrderCampaign.discount_type
                let discount_value = firstOrderCampaign.discount_value

                if(discount_type === "percentage") {
                    discount_amount = total_price*(discount_value/100)
                    discount_amount = parseFloat( discount_amount.toFixed(2) )
                    total_price = total_price - discount_amount
                } else if(discount_type === "fixed") {
                    discount_amount = discount_value
                    total_price = total_price - discount_amount
                }
            }
        }


        //create order
        const createdOrder = await Order.create({
            total_price:total_price, billing_address, customer_id: customer.id,
            company_id: customer.company_id, discount_amount: discount_amount, assisted_by:req.userInfo.msisdn,
            delivery_campaign_id:campaignId
        });

        //add order_id
        order_items = order_items.map(item => ({ ...item, order_id: createdOrder?.id, order_no: createdOrder?.order_no }))

        //create orderItems
        //bulkCreate -> allows to insert multiple records into a table in a single database query
        await OrderItem.bulkCreate(order_items);
        if(customer.first_order == 0) {
            customer.set({first_order: 1,});
            await customer.save();
        }

        let apiSuccessResponse = new ApiSuccessResponse("Order created successfully", 200, {
            total_price: createdOrder.total_price,
            discount_amount: createdOrder.discount_amount,
            ordered_at: createdOrder.created_at,
            payment_method: createdOrder.payment_method,
            billing_address: createdOrder.billing_address,
            ordered_items: order_items,
            assisted_by: req.userInfo.msisdn,
            campaign_name: campaignName,
            campaign_start_time: campaignStartTime
        });
        apiSuccessResponse.sendResponse(res);

        //clear cart - redis
        // await redis.del('cart_'+req.userInfo.uid )


    } catch (sequelize_err) {

        await logger("order-errors").log("error", `Error while placing order`, { "error": sequelize_err });

        if (sequelize_err.name === "SequelizeConnectionError") {
            console.error('Error connecting to database:', sequelize_err);
        } else if (sequelize_err.name === "SequelizeValidationError") {
            console.error('Validation error:', sequelize_err);
        } else if (sequelize_err.name === "SequelizeForeignKeyConstraintError") {
            console.error('Foreign key constraint error:', sequelize_err);
        } else if (sequelize_err.name === "SequelizeUniqueConstraintError") {
            console.error('Unique constraint error:', sequelize_err);
            return next(
                new AppError('Order must be unique', 400)
            );
        } else {
            console.error('Unknown error:', sequelize_err);
        }

        return next(
            new AppError('Something went wrong: ', 404)
        );
    }
}


const getLatestOrderBP = async (req, res, next) => {
    try {
        const latestOrder = await Order.findOne({
            where: { assisted_by: req.userInfo.msisdn },
            include: [{ model: Customer, as:'customer', attributes: ['name', 'username', 'phone'] }],
            attributes: ['id', 'total_price', 'order_no', ],
            order: [['created_at', 'DESC']],
        });

        if (!latestOrder) {
            return next(
                new AppError('No order found', 400)
            );
        }
        else {

            const latestOrderId = latestOrder.id;

            //find order_items
            const orderItems = latestOrderId && await OrderItem.findAll({ include: [{ model: Product, as: 'product', attributes: ['name'] }], attributes: ['id', 'total_price', 'quantity'], where: { order_id: latestOrderId } });

            let apiSuccessResponse =  new ApiSuccessResponse("Order Details ", 200, {order_no:latestOrder.order_no, orderItems, grand_total: latestOrder.total_price, customer: latestOrder.customer });
            apiSuccessResponse.sendResponse(res);
        }
    } catch (error) {
        console.log(error)
        return next(
            new AppError('Something Wrong', 400)
        );
    }
}

const getBpOrdersByCompany = async (req, res, next) => {
    try {
        //const companyIds = await getAdminUserWithCompanyIds(req.userInfo.msisdn);
        //const companyIds = await getAdminUserWithCompanyIds("Nahin_Rifat");
        //const companyIds = await getAdminUserWithCompanyIds("bp_leader_test");

        const { companies: companyIds } = req.userInfo

        if (!companyIds || companyIds.length === 0) {
            return next(
                new AppError('No company assigned against this user', 403)
            );
        }

        let {campaignId, campaignName, campaignStartTime} = await getCampaignByCompany(companyIds);

        /*let campaignStartTime;
        // Fetch the latest active campaign
        const latestCampaign = await DeliveryCampaign.findOne({
            where: { active_status: true },
            order: [['start_time', 'DESC']]
        });

        if (!latestCampaign) {
            campaignStartTime = new Date(); //current date
            campaignStartTime.setDate(campaignStartTime.getDate() - commonConfig.orderDays);
            return next(new AppError('No active campaign found', 400));
        } else {
            campaignStartTime = latestCampaign.start_time;
        }*/

        const filters = {};
        const customer_filters = {};
        const { order_no, shera_id, customer_phone, worker_id, name, status, page = 1, limit = 10 } = req.query;

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

        //const orders = await getOrdersByCompanies(companyIds);


        const totalOrders = await Order.count({
            // subQuery: false,
            where: {
                created_at: {
                    [Op.gte]: campaignStartTime
                },
                company_id: {
                    [Op.in]: companyIds
                },
                ...filters // Apply the filters dynamically
            },
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
            where: {
                created_at: {
                    [Op.gte]: campaignStartTime
                },
                company_id: {
                    [Op.in]: companyIds
                },
                ...filters // Apply the filters dynamically
            },
            include: [
                {
                    model: OrderItem,
                    as: 'order_items',
                    include: [
                        {
                            model: Product,
                            as: 'product',
                            attributes: ['id', 'name', 'price', 'mrp', 'unit', 'packaging', 'unit_amount']
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
            attributes: ['id', 'order_no', 'total_price', 'created_at', 'is_paid'],
            order: [['created_at', 'DESC']],
            limit: limit,
            offset: offset
        });

        let apiSuccessResponse =  new ApiSuccessResponse("Order Details ", 200, {
            total: totalOrders,
            pages: Math.ceil(totalOrders / limit),
            currentPage: page,
            orders: orders
        });

        apiSuccessResponse.sendResponse(res);

    } catch (error) {
        console.error(error);
        return next(
            new AppError('Something went wrong', 400)
        );
    }

}


const getBpOrdersByCompanyCampaign = async (req, res, next) => {
    try {
        const { companies: companyIds } = req.userInfo

        if (!companyIds || companyIds.length === 0) {
            return next(
                new AppError('No company assigned against this user', 403)
            );
        }

        let {totalOrders, pages, currentPage, orders, campaignName, campaignStartTime} = await getOrdersByFilters(companyIds, req.query);

        let apiSuccessResponse =  new ApiSuccessResponse("Order Details ", 200, {
            total: totalOrders,
            pages,
            currentPage,
            orders,
            campaignName,
            campaignStartTime
        });

        apiSuccessResponse.sendResponse(res);

    } catch (error) {
        console.log(error);
        await logger("order-errors").log("error", `Error while fetching order`, { "error": error });
        return next(
            new AppError('Something went wrong', 400)
        );
    }

}



const updateOrderStatus = async (req, res, next) => {
    try {
        const bpUserName = req.userInfo.msisdn;
        const { order_no } = req.body;

        const validOrderNoRegex = /^[a-zA-Z0-9-_]+$/;

        if (!validOrderNoRegex.test(order_no)) {
            return next(
                new AppError('Invalid order number', 400)
            );
        }

        const order = await Order.findOne({
            where: {
                order_no: order_no,
            },
            /*include: [
                {
                    model: OrderItem,
                    as: 'order_items',
                    attributes: ['id', 'quantity', 'total_price']
                }
            ],*/
        });

        if (order === null) {
            return next(
                new AppError('Order does not exist', 404)
            );

        } else {

            const adminUser = await AdminUser.findOne({
                where: { username: bpUserName },
                include: [{
                    model: Company,
                    as: 'companies',
                    through: { attributes: [] }, // This will exclude the join table attributes
                    attributes: ['id', 'company_name']
                }]
            });

            order.set({
                is_paid: true,
                is_delivered: true,
                delivered_by: adminUser.id,
                paid_at: moment().format('YYYY-MM-DD HH:mm:ss'),
                delivered_at: moment().format('YYYY-MM-DD HH:mm:ss'),
                updated_at: moment().format('YYYY-MM-DD HH:mm:ss')
            });
            await order.save();

            let apiSuccessResponse = new ApiSuccessResponse("Order status updated", 200, order);
            apiSuccessResponse.sendResponse(res);
        }

    } catch (error) {
        console.log(error)
        return next(
            new AppError('Something Wrong', 400)
        );
    }
}



const getBpOrdersSelf = async (req, res, next) => {
    try {

        const { companies: companyIds } = req.userInfo

        if (!companyIds || companyIds.length === 0) {
            return next(
                new AppError('No company assigned against this user', 403)
            );
        }

        let {campaignId, campaignName, campaignStartTime} = await getCampaignByCompany(companyIds);


        const filters = {};
        const customer_filters = {};
        const { order_no, shera_id, customer_phone, worker_id, name, status, page = 1, limit = 10 } = req.query;

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

        const whereClause = campaignId ?
            {
                assisted_by: req.userInfo.msisdn,
                delivery_campaign_id: campaignId,
                ...filters
            } :
            {
                assisted_by: req.userInfo.msisdn,
                created_at: {
                    [Op.gte]: campaignStartTime
                },
                ...filters
            };



        const totalOrders = await Order.count({
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
            attributes: ['id', 'order_no', 'total_price', 'created_at', 'is_paid'],
            order: [['created_at', 'DESC']],
            limit: limit,
            offset: offset
        });

        let apiSuccessResponse =  new ApiSuccessResponse("Order Details ", 200, {
            total: totalOrders,
            pages: Math.ceil(totalOrders / limit),
            currentPage: page,
            orders: orders,
            campaign_name: campaignName,
            campaign_start_time: campaignStartTime
        });

        apiSuccessResponse.sendResponse(res);

    } catch (error) {
        console.error(error);
        await logger("order-errors").log("error", `Error while fetching order`, { "error": error });
        return next(
            new AppError('Something went wrong', 400)
        );
    }

}


const checkDuplicateOrders = async (req, res, next) => {
    try {

        const uid = req.body.uid || req.userInfo.uid;
        const { companies } = req.userInfo;

        const customer = await Customer.findOne({
            where: {uid: uid}
        });

        let companyIds;

        if (companies) {
            companyIds = companies;
        } else {
            if (customer) {
                companyIds = [customer.company_id]; // Convert company_id to an array
            } else {
                return next(
                    new AppError('No company assigned against this user', 403)
                );
            }
        }

        let {campaignId, campaignName, campaignStartTime} = await getCampaignByCompany(companyIds);

        const { orderItems } = req.body;

        for (const item of orderItems) {
            const { product_id, qty } = item;

            // Fetch all previous orders with the same product_id and qty for this user
            const existingOrderItems = await OrderItem.findAll({
                where: { product_id, quantity: qty },
                include: [{
                    model: Order,
                    as: 'order',
                    where: {
                        //delivery_campaign_id: campaignId,
                        created_at: {
                            [Op.gte]: campaignStartTime
                        },
                        customer_id: customer.id
                    }
                }]
            });

            if (existingOrderItems.length === 1) {
                // Allow one duplicate with alert
                return res.status(200).json({
                    status: "SUCCESS",
                    status_code: 409,
                    is_allowed: true,
                    campaign_name: campaignName,
                    campaign_start_time: moment(campaignStartTime).format("YYYY-MM-DD HH:mm:ss"),
                    message: 'This is a duplicate order. It will be allowed, but further duplicates will be blocked.'
                });
            } else if (existingOrderItems.length > 1) {
                // Disallow further duplicates
                return res.status(403).json({
                    status: "SUCCESS",
                    status_code: 403,
                    is_allowed: false,
                    campaign_name: campaignName,
                    campaign_start_time: moment(campaignStartTime).format("YYYY-MM-DD HH:mm:ss"),
                    message: 'Duplicate orders are not allowed.'
                });
            }
        }

        // No duplicates found, proceed is allowed
        res.status(200).json({
            status: "SUCCESS",
            status_code: 200,
            is_allowed: true,
            campaign_name: campaignName,
            campaign_start_time: moment(campaignStartTime).format("YYYY-MM-DD HH:mm:ss"),
            message: 'No duplicate orders found. You can proceed.'
        });

    } catch (error) {
        console.error(error);
        return next(
            new AppError('Something went wrong', 400)
        );
    }

}

// to be written
const checkDuplicateOrdersPerDay = async (req, res, next) => {
    try {

        const uid = req.body.uid || req.userInfo.uid;
        const { companies, msisdn } = req.userInfo;

        const customer = await Customer.findOne({
            where: {uid: uid}
        });

        if (!customer) {
            return next(new AppError('No customer found with this UID', 404));
        }

        const companyIds = companies || [customer.company_id];

        if (!companyIds.length) {
            return next(new AppError('No company assigned to this user', 403));
        }

        const existingOrderForToday = await Order.findAll({
            where: { 
                customer_id: customer.id,
                assisted_by: msisdn,
                created_at: {
                // [Op.gte]: campaignStartTime
                [Op.gte]: fn('DATE', literal('CURRENT_DATE')),
                }
            },
        });


        if (existingOrderForToday.length > 0) {
            return res.status(403).json({
                status: "SUCCESS",
                status_code: 403,
                is_allowed: false,
                // campaign_name: campaignName,
                // campaign_start_time: moment(campaignStartTime).format("YYYY-MM-DD HH:mm:ss"),
                message: 'No more orders are allowed for this customer today'
            });
        }
        return res.status(200).json({
            status: "SUCCESS",
            status_code: 200,
            is_allowed: true,
            message: 'No duplicate orders found. You can proceed.'
        });

    } catch (error) {
        console.error(error);
        return next(
            new AppError('Something went wrong', 400)
        );
    }

}





const updateOrder = async (req, res, next) => {
    try {
        const bpUserName = req.userInfo.msisdn;
        const { order_no, orderItems} = req.body;

        const validOrderNoRegex = /^[a-zA-Z0-9-_]+$/;

        if (!validOrderNoRegex.test(order_no)) {
            return next(
                new AppError('Invalid order number', 400)
            );
        }

        const order = await Order.findOne({
            where: {
                order_no: order_no,
            },
        });

        if (order === null) {
            return next(
                new AppError('Order does not exist', 404)
            );

        } else {

            const availableOrderItems = await OrderItem.findAll( {
                where: { order_no: order_no },
                attributes: ['id', 'total_price', 'quantity', 'unit_price', 'product_id'],
            });

            let total_price = 0;
            let update_count = 0;
            let order_items_to_create = [];
            let order_items_to_update = [];

            let product_ids_in_orderItems = orderItems.map(item => item.product_id);
            let order_items_to_delete = availableOrderItems.filter(item => !product_ids_in_orderItems.includes(item.product_id));



            for (const { product_id, qty } of orderItems) {

                const matchingOrderItem = availableOrderItems.find(item => item.product_id === product_id);

                if (matchingOrderItem) {
                    update_count += 1;
                    // Existing item, prepare it for updating
                    const updated_total_price = matchingOrderItem.unit_price * qty;
                    total_price += updated_total_price;

                    order_items_to_update.push({
                        id: matchingOrderItem.id, // Existing record's ID
                        total_price: updated_total_price,
                        quantity: qty,
                        unit_price: matchingOrderItem.unit_price, // Keeping the existing unit price
                    });
                } else {
                    // New item, prepare it for creation
                    const product = await Product.findByPk(product_id, {
                        attributes: ['id', 'mrp'],
                    });

                    if (!product) {
                        new AppError('Product Not Found', 404);
                    }

                    const total_item_price = product.mrp * qty;
                    total_price += total_item_price;

                    order_items_to_create.push({
                        product_id: product.id,
                        total_price: total_item_price,
                        quantity: qty,
                        unit_price: product.mrp,
                        company_id: order.company_id,
                        order_no: order_no,
                        order_id: order.id,
                    });
                }
            }

            // Delete order items that are no longer needed
            if (order_items_to_delete.length > 0) {
                const ids_to_delete = order_items_to_delete.map(item => item.id);
                await OrderItem.destroy({ where: { id: ids_to_delete } });
            }

            // Bulk create new order items
            if (order_items_to_create.length > 0) {
                await OrderItem.bulkCreate(order_items_to_create);
            }

            if(update_count > 0) {
                // Update existing order items
                for (const item of order_items_to_update) {
                    await OrderItem.update(
                        {
                            total_price: item.total_price,
                            quantity: item.quantity,
                            unit_price: item.unit_price,
                            updated_at: moment().format('YYYY-MM-DD HH:mm:ss')
                        },
                        {
                            where: { id: item.id }
                        }
                    );
                }
            }

            order.set({
                total_price: total_price,
                updated_at: moment().format('YYYY-MM-DD HH:mm:ss')
            });
            await order.save();

            let apiSuccessResponse = new ApiSuccessResponse("Order status updated", 200, order);
            apiSuccessResponse.sendResponse(res);
        }

    } catch (error) {
        console.log(error)
        await logger("order-errors").log("error", `Error while updating order`, { "error": error });
        return next(
            new AppError('Something Went Wrong', 400)
        );
    }
}



module.exports = {
    createOrder, getAllOrder, getOrder, getOrderByCustomer, getLatestOrder, createAssistedOrder,
    getLatestOrderBP, getBpOrdersByCompany, updateOrderStatus, getBpOrdersSelf, getBpOrdersByCompanyCampaign,
    checkDuplicateOrders,checkDuplicateOrdersPerDay, updateOrder
}
