
module.exports = (sequelize, DataTypes) => {
    const AdminUser = sequelize.define("admin_users", {
            id: {
                type: DataTypes.BIGINT,
                primaryKey: true,
                autoIncrement: true,
            },
            username: {
                type: DataTypes.STRING(255),
                allowNull: false,
            },
            password: {
                type: DataTypes.STRING(255),
                allowNull: false,
            },
            name: {
                type: DataTypes.STRING(255),
            },
            avatar: {
                type: DataTypes.STRING(255),
            },
            remember_token: {
                type: DataTypes.STRING(255),
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
            timestamps: false
        },
    );
    return AdminUser
}

// Company.hasOne(Customer, {
//     foreignKey: 'company_id',
//     sourceKey: 'id',
//     onDelete: 'CASCADE',
// });

// Customer.belongsTo(Company, {
//     foreignKey: 'company_id',
//     targetKey:'id'
// });

// module.exports = Company;
