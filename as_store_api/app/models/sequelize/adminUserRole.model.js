
module.exports = (sequelize, DataTypes) => {
    const AdminUserRole = sequelize.define("admin_role_users", {
        role_id: {
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
    return AdminUserRole
}


