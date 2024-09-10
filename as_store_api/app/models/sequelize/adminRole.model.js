
module.exports = (sequelize, DataTypes) => {
    const AdminRole = sequelize.define("admin_roles", {
            id: {
                type: DataTypes.BIGINT,
                primaryKey: true,
                autoIncrement: true,
            },
            name: {
                type: DataTypes.STRING(255),
                allowNull: false,
            },
            slug: {
                type: DataTypes.STRING(255),
                allowNull: false,
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
    return AdminRole
}


