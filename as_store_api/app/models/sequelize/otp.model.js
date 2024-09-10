
module.exports = (sequelize,DataTypes) =>{
    const Otp = sequelize.define("otp", {
        id: {
            type: DataTypes.BIGINT,
            autoIncrement: true,
            primaryKey: true
        },
        msisdn: {
            type: DataTypes.STRING
        },
        otp: {
            type: DataTypes.STRING,
            allowNull: false
        },
        expires_at: {
            type: DataTypes.BIGINT,
        },
        created_at: {
            type: 'timestamp without time zone',
            allowNull: true
        }
    },
        {
            freezeTableName: true,
            timestamps: true, //false for avoiding createdAt and updatedAt both
            createdAt: "created_at",
            updatedAt: false
        }
    );
return Otp
}

// Otp.sync();
// module.exports = Otp;
