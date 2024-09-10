
module.exports = (sequelize, DataTypes) => {
    const AdminUserCompany = sequelize.define("admin_user_companies", {
        id: {
            type: DataTypes.BIGINT,
            primaryKey: true,
            autoIncrement: true,
        },
        company_id: {
            type: DataTypes.INTEGER,
        },
        user_id: {
            type: DataTypes.INTEGER,
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
    return AdminUserCompany
}


