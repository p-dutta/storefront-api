const db = require("../models/sequelize");
const {Op} = require("sequelize");
const Order = db.orders;
const OrderItem = db.order_items;
const Product = db.products;
const Customer = db.customer;
const Company = db.company;
const AdminUser = db.adminUser;


const getAdminUserWithCompanyIds = async (username) => {
    const adminUser = await AdminUser.findOne({
        where: { username: username },
        include: [{
            model: Company,
            as: 'companies',
            through: { attributes: [] }, // This will exclude the join table attributes
            attributes: ['id', 'company_name']
        }]
    });

    if (!adminUser) {
        return null
    }

    // Extract company IDs
    return adminUser.companies.map(company => company.id);
};


const getOrdersByCompanies = async (companyIds) => {
    return await Order.findAll({
        where: {
            company_id: {
                [Op.in]: companyIds
            }
        },
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
        attributes: ['id', 'order_no', 'total_price', 'created_at'],
        order: [['created_at', 'DESC']]
    });
};


module.exports = {
    getAdminUserWithCompanyIds, getOrdersByCompanies
};