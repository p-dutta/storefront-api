
module.exports = (sequelize, DataTypes) => {
    const OrderItem = sequelize.define("order_items", {
       
        total_price: {
            type: DataTypes.FLOAT,
            allowNull: false,
            //default 0
        },
        unit_price: {
            type: DataTypes.FLOAT,
            allowNull: false,
            //default 0
        },

        is_active: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true,
        },
        quantity: {
            type: DataTypes.INTEGER,
        },
        company_id: {
            type: DataTypes.INTEGER,
        },
        order_no: {
            type: DataTypes.STRING(255),
            unique: true
        },
        created_at: {
            type: DataTypes.DATE,
        },
        updated_at: {
            type: DataTypes.DATE,
        },
    },
        {
            freezeTableName: true,
            timestamps: true,
            createdAt: "created_at",
            updatedAt: "updated_at",
        },
    );
    return OrderItem
}


