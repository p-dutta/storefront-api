
module.exports = (sequelize,DataTypes) =>{
    const CampaignMetrics = sequelize.define("campaign_metrics", {
            id: {
                type: DataTypes.BIGINT,
                primaryKey: true,
                autoIncrement: true,
            },
            campaign_id: {
                type: DataTypes.BIGINT,
                allowNull: false,
            },
            customer_id: {
                type: DataTypes.BIGINT,
                allowNull: false,
            },
            order_id: {
                type: DataTypes.BIGINT,
            },
            // metrics: redeems, views, clicks
            metric_type: {
                type: DataTypes.STRING(255),
            },
            paid_amount: {
                type: DataTypes.DOUBLE,
            },
            discount_amount: {
                type: DataTypes.DOUBLE,
            },
        },
        {
            freezeTableName: true,
            timestamps: true,
            createdAt: "created_at",
            updatedAt: "updated_at",
        },
    );
    //CampaignMetrics.sync({alter:true});
    return CampaignMetrics
}

