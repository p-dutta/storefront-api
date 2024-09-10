
module.exports = (sequelize,DataTypes) =>{
    const Campaign = sequelize.define("campaigns", {
            id: {
                type: DataTypes.BIGINT,
                primaryKey: true,
                autoIncrement: true,
            },
            name: {
                type: DataTypes.STRING(255),
                allowNull: false,
            },
            campaign_type: {
                type: DataTypes.STRING(255),
                allowNull: false,
            },
            slug: {
                type: DataTypes.STRING(255),
                allowNull: false,
                unique: true
            },
            description: {
                type: DataTypes.TEXT,
                allowNull: true,
            },
            start_date: {
                type: DataTypes.DATE,
            },
            end_date: {
                type: DataTypes.DATE,
            },
            status: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                default: 1
            },
            discount_type: {
                type: DataTypes.STRING(100),
                allowNull:false
            },
            discount_value: {
                type: DataTypes.DOUBLE,
                allowNull:false
            },
            conditions: {
                type: DataTypes.JSONB,
            },
        },
        {
            freezeTableName: true,
            timestamps: true,
            createdAt: "created_at",
            updatedAt: "updated_at",
        },
    );
    //Campaign.sync({alter:true});
    return Campaign
}
