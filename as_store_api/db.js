const dbConfig = require("./config/db.config.js");

const Sequelize = require("sequelize");

module.exports = db = {};

const sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
    host: dbConfig.HOST,
    port: dbConfig.PORT,
    dialect: dbConfig.dialect,
    //schema: dbConfig.SCHEMA,
    pool: {
        max: dbConfig.pool.max,
        min: dbConfig.pool.min,
        acquire: dbConfig.pool.acquire,
        idle: dbConfig.pool.idle
    },
    dialectOptions: {
        //useUTC: dbConfig.dialectOptions.useUTC, //for reading from database
        dateStrings: true,
        timezone: '+06:00',
        typeCast: true
    },
    timezone: dbConfig.timezone
});


db.sequelize = sequelize;

db.GuestUserInfo = require("./app/models/sequelize/guestUserInfo.model.js");
db.Customer = require("./app/models/sequelize/customer.model.js");
db.RefreshToken = require("./app/models/sequelize/refreshToken.model.js");
db.CustomerDigitalServices = require("./app/models/sequelize/customerDigitalService.model.js");
db.Otp = require("./app/models/sequelize/otp.model.js");
db.Company = require("./app/models/sequelize/company.model.js");
db.HrData = require("./app/models/sequelize/hrData.model");
db.StaticProduct = require("./app/models/sequelize/staticProduct.model");

/*db.Customer.hasOne(db.Company, {
    foreignKey: 'customer_id',
    sourceKey: 'id',
    //onDelete: 'CASCADE',
    constraints: false
})*/


// db.sequelize.authenticate().then(() => {
//     console.log('Connection has been established successfully.');
// }).catch((error) => {
//     console.error('Unable to connect to the database: ', error);
// });


/*
try {
    await db.sequelize.authenticate();
    console.log('Connection has been established successfully.');
} catch (error) {
    console.error('Unable to connect to the database:', error);
}
*/


/*db.sequelize.sync({alter:true}).then(() => {*/
/*db.sequelize.sync().then(() => {
    console.log('Tables synced');
}).catch((error) => {
    console.error('Unable to sync table : ', error);
});*/

module.exports = db;