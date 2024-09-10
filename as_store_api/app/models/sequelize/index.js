const dbConfig = require("../../../config/db.config.js");

const { Sequelize, DataTypes } = require("sequelize");

const sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
    host: dbConfig.HOST,
    port: dbConfig.PORT,
    dialect: dbConfig.dialect,
    pool: {
        max: dbConfig.pool.max,
        min: dbConfig.pool.min,
        acquire: dbConfig.pool.acquire,
        idle: dbConfig.pool.idle
    },
    dialectOptions: {
        //useUTC: dbConfig.dialectOptions.useUTC, //for reading from database
        useUTC: false,
        dateStrings: true,
        timezone: '+06:00',
        typeCast: true
    },
    timezone: dbConfig.timezone
});

sequelize.authenticate().then(() => {
    console.log('Connection has been established successfully.');
}).catch((error) => {
    console.error('Unable to connect to the database: ', error);
});


const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;


db.refreshToken = require("./refreshToken.model.js")(sequelize,DataTypes);
db.customer = require("./customer.model.js")(sequelize, DataTypes);
db.company = require('./company.model.js')(sequelize, DataTypes);
db.category = require('./category.model.js')(sequelize, DataTypes);
db.products = require('./product.model.js')(sequelize, DataTypes);
db.orders = require('./order.model.js')(sequelize, DataTypes);
db.order_items = require('./orderItems.model.js')(sequelize, DataTypes);
db.hrData = require('./hrData.model.js')(sequelize, DataTypes);
db.otp = require('./otp.model.js')(sequelize, DataTypes);
db.carousel = require('./carousel.model')(sequelize, DataTypes);
db.carousel = require('./carousel.model')(sequelize, DataTypes);
db.campaign = require('./campaign.model')(sequelize, DataTypes);
db.campaignMetrics = require('./campaignMetrics.model')(sequelize, DataTypes);
db.adminUser = require('./adminUser.model')(sequelize, DataTypes);
db.adminUserCompany = require('./adminUserCompany.model')(sequelize, DataTypes);
db.adminRole = require('./adminRole.model')(sequelize, DataTypes);
db.adminUserRole = require('./adminUserRole.model')(sequelize, DataTypes);
db.deliveryCampaign = require('./deliveryCampaign.model')(sequelize, DataTypes);
db.deliveryCampaignTarget = require('./deliveryCampaignTarget.model')(sequelize, DataTypes);


db.refreshToken.belongsTo(db.customer, {
    foreignKey: 'uid',
    targetKey: 'uid'
});

//company-customer
db.company.hasOne(db.customer, {
    foreignKey: 'company_id',
    //onDelete: 'CASCADE',
    as:'customer'
});
db.customer.belongsTo(db.company, {
    foreignKey: 'company_id',
    as:'company'
});

//category-product
db.category.hasMany(db.products, {
    foreignKey: 'category_id',
    as: 'product',
    //onDelete: 'CASCADE',
});

db.products.belongsTo(db.category, {
    foreignKey: 'category_id',
    as: 'category'
});

//customer-order
db.customer.hasMany(db.orders, {
    foreignKey: 'customer_id',
    //onDelete: 'CASCADE',
    as: 'order'
});

db.orders.belongsTo(db.customer, {
    foreignKey: 'customer_id',
    constraints: false,
    as: 'customer'
});


//order - order_items - product
db.orders.hasMany(db.order_items, {
    foreignKey: 'order_id',
    onDelete: 'CASCADE',
    as: 'order_items'
});

db.order_items.belongsTo(db.orders, {
    foreignKey: 'order_id',
    as: 'order'
});


//campaign-order
db.deliveryCampaign.hasMany(db.orders, {
    foreignKey: 'delivery_campaign_id',
    as: 'orders'
});

db.orders.belongsTo(db.deliveryCampaign, {
    foreignKey: 'delivery_campaign_id',
    constraints: false,
    as: 'campaign'
});



db.products.hasMany(db.order_items, {
    foreignKey: 'product_id',
    as: 'order_items'
});

db.order_items.belongsTo(db.products, {
    foreignKey: 'product_id'
});

db.hrData.belongsTo(db.company,{
    foreignKey:'company_id',
    as:'company'
})


db.campaignMetrics.belongsTo(db.campaign, {
    foreignKey: 'campaign_id',
    constraints: false,
    as: 'campaign'
});

db.campaignMetrics.belongsTo(db.orders, {
    foreignKey: 'order_id',
    constraints: false,
    as: 'order'
});

db.campaignMetrics.belongsTo(db.customer, {
    foreignKey: 'customer_id',
    constraints: false,
    as: 'customer'
});

db.adminUser.belongsToMany(db.company,{foreignKey:'user_id',through:db.adminUserCompany});
db.company.belongsToMany(db.adminUser,{foreignKey:'company_id',through:db.adminUserCompany});

db.adminUser.belongsToMany(db.adminRole,{foreignKey:'user_id',through:db.adminUserRole});
db.adminRole.belongsToMany(db.adminUser,{foreignKey:'role_id',through:db.adminUserRole});


db.deliveryCampaign.hasMany(db.deliveryCampaignTarget, {
    foreignKey: 'campaign_id',
    as: 'campaign_targets'
});

db.deliveryCampaignTarget.belongsTo(db.deliveryCampaign, {
    foreignKey: 'campaign_id'
});



// db.sequelize.sync()
//     .then(() => {
//         console.log('drop & re-sync done!')
//     })

module.exports = db;