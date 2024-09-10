

module.exports = (sequelize,DataTypes) =>{
    const Product = sequelize.define("products", {
        id: {
            type: DataTypes.BIGINT,
            primaryKey: true,
            autoIncrement: true,
        },
        // category_id: {
        //     type: DataTypes.INTEGER,
        //     allowNull: false,
        //     references: {
        //         model: Category,
        //         key: 'id'
        //     }
        // },
        name: {
            type: DataTypes.STRING(255),
            allowNull: false,
            unique: true
        },
        price: {
            type: DataTypes.DOUBLE,
            allowNull: true,
            default:0
        },
        vat: {
            type: DataTypes.FLOAT,
            allowNull: true,
            default:0
        },
        mrp: {
            type: DataTypes.DOUBLE,
            allowNull: true,
            default:0
        },
        market_price: {
            type: DataTypes.DOUBLE,
            allowNull: true,
            default:0
        },
        packaging: {
            type: DataTypes.STRING(100),
            allowNull: true,
        },
        unit_amount: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        unit: {
            type: DataTypes.STRING(100),
            allowNull: true,
        },
        image_url: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        is_active: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
        },
        in_stock_amount: {
            type: DataTypes.INTEGER,
        },
        priority: {
            type: DataTypes.INTEGER,
        },
        deleted_by: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        deleted_at: {
            type: DataTypes.DATE,
            allowNull: true
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
return Product
}

// Product.belongsTo(Category, {
//     foreignKey: 'category_id',
//     targetKey:'id'
// });

// Product.sync();
// module.exports = Product;
