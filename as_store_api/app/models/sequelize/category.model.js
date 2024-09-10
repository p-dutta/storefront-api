
module.exports = (sequelize,DataTypes) =>{

    const Category = sequelize.define("category", {
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            
            name: {
                type: DataTypes.STRING,
            },
            status: {
                type: DataTypes.BOOLEAN,
                defaultValue: true,
                allowNull: false,
            },
        },
        {
            freezeTableName: true,
            timestamps: true,
            createdAt: "created_at",
            updatedAt: "updated_at",
        },
    )
    return Category;
}

// Category.hasMany(Product, {
//     foreignKey: 'category_id',
//     sourceKey: 'id',
//     onDelete: 'CASCADE',
// });

// Product.belongsTo(Category, {
//     foreignKey: 'category_id',
//     targetKey:'id'
// });

// Category.sync();

// module.exports = Category;
