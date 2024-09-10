const {DataTypes} = require('sequelize');
const db = require('../../../db');
const sequelize = db.sequelize;

const StaticProduct = sequelize.define("products", {
    id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },
    product_name: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    market_price: {
        type: DataTypes.DOUBLE,
        allowNull: false
    },
    discounted_price: {
        type: DataTypes.DOUBLE,
        allowNull: false
    },
    category: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    tags: {
        type: DataTypes.JSONB // Use JSONB for JSON data in PostgreSQL
    },
    is_active: {
        type: DataTypes.SMALLINT,
        allowNull: false,
        defaultValue: 0
    },
    deleted_at: {
        type: DataTypes.DATE
    },
    created_at: {
        type: DataTypes.DATE
    },
    updated_at: {
        type: DataTypes.DATE
    }
}, {
    tableName: 'products',
    timestamps: false
});

//StaticProduct.sync();


module.exports = StaticProduct;
