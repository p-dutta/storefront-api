
module.exports = (sequelize,DataTypes) =>{
    const Order = sequelize.define("orders", {
        id: {
            type: DataTypes.BIGINT,
            primaryKey: true,
            autoIncrement: true,
        },
        // customer_id: {
        //     type: DataTypes.INTEGER,
        //     allowNull: false,
        //     references: {
        //         model: Customer,
        //         key: 'id'
        //     }
        // },
        order_no: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        billing_address: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        total_price: {
            type: DataTypes.DOUBLE,
            allowNull:false
        },
        discount_amount: {
            type: DataTypes.DOUBLE,
            allowNull:true
        },
        vat: {
            type: DataTypes.FLOAT,
            allowNull: true
        },
       
        payment_method: {
            type: DataTypes.STRING(100),
            allowNull: true,
        },
        is_paid: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        is_delivered: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        delivered_by: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        delivered_at: {
            type: DataTypes.DATE,
            allowNull: true
        },
        paid_at: {
            type: DataTypes.DATE,
            allowNull: true
        },
        company_id: {
            type: DataTypes.INTEGER,
        },
        assisted_by: {
            type: DataTypes.STRING(100),
            allowNull: true
        },
        delivery_campaign_id: {
            type: DataTypes.BIGINT,
        },
        created_at: {
            type: DataTypes.DATE,
            allowNull: true
        },
        updated_at: {
            type: DataTypes.DATE,
            allowNull: true
        },
    },
        {
            freezeTableName: true,
            timestamps: true,
            createdAt: "created_at",
            updatedAt: "updated_at",
        },
    );
return Order
}

//@define hasMany in Customer Model with this Model
//@define hasMany in this Model with OrderItems Model



// Order.sync({alter:true});
// module.exports = Order;
