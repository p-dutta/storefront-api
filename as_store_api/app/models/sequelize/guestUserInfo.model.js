
module.exports = (sequelize, DataTypes) => {
    const GuestUserInfo = sequelize.define("guest_user_info", {

        uid: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        device_token: {
            type: DataTypes.STRING,
            unique: 'actions_unique'
        },
        ad_id: {
            type: DataTypes.STRING,
            unique: 'actions_unique'
        },
        msisdn: {
            type: DataTypes.STRING
        },
    },
        {
            freezeTableName: true,   // do not pluralize the table name
            timestamps: true,
            createdAt: "created_at", // alias createdAt as created_at
            updatedAt: "updated_at", // alias updatedAt as updated_at
            uniqueKeys: {
                actions_unique: {
                    fields: ['device_token', 'ad_id']
                }
            }

            /*indexes: [
                {
                    unique: true,
                    fields: ['device_token', 'ad_id']
                }
            ]*/

        },

    );
    return GuestUserInfo;
}


// module.exports = GuestUserInfo;
