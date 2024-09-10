module.exports = (sequelize, DataTypes) => {
    const DeliveryCampaignTarget = sequelize.define("delivery_campaign_targets", {
            id: {
                type: DataTypes.BIGINT,
                primaryKey: true,
                autoIncrement: true,
            },
            bp_user_id: {
                type: DataTypes.STRING(255),
                allowNull: false,
            },
            campaign_id: {
                type: DataTypes.BIGINT,
                allowNull: false,
            },
            company_id: {
                type: DataTypes.BIGINT,
            },
            target: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 500,
            },
            fulfilment_percentage: {
                type: DataTypes.NUMERIC(5, 2),
                allowNull: false,
                defaultValue: '0.00',
            },
            active_status: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: false,
            },
            deleted_at: {
                type: DataTypes.DATE,
                allowNull: true,
            },
            created_by: {
                type: DataTypes.STRING(255),
                allowNull: false,
            },
            updated_by: {
                type: DataTypes.STRING(255),
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

    return DeliveryCampaignTarget;
}
