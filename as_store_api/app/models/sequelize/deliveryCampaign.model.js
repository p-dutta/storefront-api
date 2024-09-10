module.exports = (sequelize, DataTypes) => {
    const DeliveryCampaign = sequelize.define("delivery_campaigns", {
            id: {
                type: DataTypes.BIGINT,
                primaryKey: true,
                autoIncrement: true,
            },
            name: {
                type: DataTypes.STRING(255),
                allowNull: false,
            },
            start_time: {
                type: DataTypes.DATE,
                allowNull: false,
            },
            end_time: {
                type: DataTypes.DATE,
                allowNull: false,
            },
            details: {
                type: DataTypes.JSON,
            },
            company_id: {
                type: DataTypes.BIGINT,
            },
            active_status: {
                type: DataTypes.BOOLEAN,
                defaultValue: false,
                allowNull: false,
            },
            created_by: {
                type: DataTypes.STRING(255),
                allowNull: false,
            },
            updated_by: {
                type: DataTypes.STRING(255),
                allowNull: true,
            },
            deleted_at: {
                type: DataTypes.DATE,
                allowNull: true,
            },
            created_at: {
                type: DataTypes.DATE,
                allowNull: false,
            },
            updated_at: {
                type: DataTypes.DATE,
                allowNull: false,
            },
        },
        {
            freezeTableName: true,
            timestamps: true,
            createdAt: "created_at",
            updatedAt: "updated_at",
        });

    return DeliveryCampaign;
}
