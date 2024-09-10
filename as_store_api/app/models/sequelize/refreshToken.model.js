
const config = require("../../../config/auth.config");

module.exports = (sequelize,DataTypes) =>{
    const RefreshToken = sequelize.define("refresh_tokens", {
            token: {
                type: DataTypes.TEXT,
            },
            msisdn: {
                type: DataTypes.STRING
            },
            expiry_date: {
                type: DataTypes.DATE,
            },
    
            // this is for M2M relationships
            /*uid: {
                type: DataTypes.UUID,
                references: {
                    model: Customer,
                    key: 'uid',
                    constraints: false
                }
            }*/
        },
        {
            freezeTableName: true,
            timestamps: true,
            createdAt: "created_at",
            updatedAt: "updated_at",
        }
    
    );

    RefreshToken.createToken = async function (token, msisdn, uid) {
        const refreshTokenForSameUid = await this.findOne({
            where: { uid: uid}
        });
    
        let expiredAt = new Date();
        let refreshToken = null;
    
        expiredAt.setSeconds(expiredAt.getSeconds() + config.jwtRefreshExpiration);
    
        if (refreshTokenForSameUid === null) {
            refreshToken = await this.create({
                token: token,
                msisdn: msisdn,
                expiry_date: expiredAt.getTime(),
                uid: uid
            });
        } else {
            refreshTokenForSameUid.set({
                token: token,
                msisdn: msisdn,
                expiry_date: expiredAt.getTime(),
            });
            refreshToken = await refreshTokenForSameUid.save();
        }
        return refreshToken;
    };
    
    RefreshToken.verifyExpiration = (token) => {
        return new Date(token.expiry_date).getTime() < new Date().getTime();
    };
    
    return RefreshToken

}


// RefreshToken.belongsTo(Customer, {
//     foreignKey: 'uid',
//     targetKey: 'uid'
// });







/*RefreshToken.sync({alter:true}).then(() => {
    console.log('refresh_tokens table synced');
}).catch((error) => {
    console.error('Unable to sync refresh_tokens table : ', error);
});*/

// RefreshToken.sync();
// module.exports = RefreshToken;
