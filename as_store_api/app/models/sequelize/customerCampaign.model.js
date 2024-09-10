
module.exports = (sequelize,DataTypes) =>{
    const CustomerCampaign = sequelize.define("customer_campaigns", {
            id: {
                type: DataTypes.BIGINT,
                primaryKey: true,
                autoIncrement: true,
            },
            campaign_id: {
                type: DataTypes.BIGINT,
            },
            customer_id: {
                type: DataTypes.BIGINT,
                allowNull: false,
            },
            status: {
                type: DataTypes.STRING(255),
            },
            redeemed_at: {
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
    //CustomerCampaign.sync({alter:true});
    return CustomerCampaign
}

