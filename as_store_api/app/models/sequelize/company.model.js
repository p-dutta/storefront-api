
module.exports = (sequelize, DataTypes) => {
    const Company = sequelize.define("company", {
        id: {
            type: DataTypes.BIGINT,
            primaryKey: true,
            autoIncrement: true,
        },
        company_name: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        company_address: {
            type: DataTypes.TEXT,
        },
        company_poc_name: {
            type: DataTypes.STRING(255),
        },
        company_poc_contact: {
            type: DataTypes.STRING(255),
        },
        is_active: {
            type: DataTypes.SMALLINT,
            allowNull: false,
            defaultValue: 1,
        },
        deleted_by: {
            type: DataTypes.INTEGER,
        },
        deleted_at: {
            type: DataTypes.DATE,
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
    return Company
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
