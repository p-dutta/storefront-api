
module.exports = (sequelize, DataTypes) => {
    const Customer = sequelize.define("customer", {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        uid: {
            type: DataTypes.UUID,
            unique: true,
            /*references: {
                model: GuestUserInfo,
                key: 'uid'
            }*/
        },
        name: {
            type: DataTypes.STRING
        },
        gender: {
            type: DataTypes.STRING
        },
        emp_id: {
            type: DataTypes.STRING
        },
        dob: {
            type: DataTypes.DATEONLY
        },
        email: {
            type: DataTypes.STRING
        },
        phone: {
            type: DataTypes.STRING,
            unique: true
        },
        pin: {
            type: DataTypes.STRING
        },
        role: {
            type: DataTypes.STRING
        },
        supervisor_uid: {
            type: DataTypes.UUID
        },
        // company_id: {
        //     type: DataTypes.BIGINT,
        //     references: {
        //         model: Company,
        //         key: 'id',
        //         constraints: false
        //     }
        // },
        // company_id: {
        //     type: DataTypes.UUID,
        //     references: {
        //         model: Company,
        //         key: 'id',
        //         constraints: false
        //     }
        // },
        profile_image_info: {
            type: DataTypes.STRING
        },
        os_type: {
            type: DataTypes.STRING
        },
        device_info: {
            type: DataTypes.STRING
        },
        first_login_at: {
            type: DataTypes.DATE
            //defaultValue: DataTypes.NOW
        },
        last_login_at: {
            type: DataTypes.DATE
            //defaultValue: DataTypes.NOW
        },
        platform: {
            type: DataTypes.STRING
        },
        app_version: {
            type: DataTypes.STRING
        },
        is_soft_deleted: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            allowNull: false
        },
        soft_deleted_at: {
            type: DataTypes.DATE
        },
        is_hr_verified: {
            type: DataTypes.SMALLINT,
            allowNull: false,
            defaultValue: 0
        },
        first_order: {
            type: DataTypes.SMALLINT,
            allowNull: false,
            defaultValue: 0
        },
        username: {
            type: DataTypes.STRING
        },

    },
        {
            freezeTableName: true,
            timestamps: true,
            createdAt: "created_at",
            updatedAt: "updated_at",
        },
    )
    return Customer;
}


// Customer.hasMany(Order, {
//     foreignKey: 'customer_id',
//     sourceKey: 'id',
//     onDelete: 'CASCADE',
// });

// Order.belongsTo(Customer, {
//     foreignKey: 'customer_id',
//     targetKey:'id'
// });
/*Customer.sync({alter:true}).then(() => {
    console.log('customers table synced');
}).catch((error) => {
    console.error('Unable to sync customers table : ', error);
});*/

// Customer.sync({alter:true});

// module.exports = Customer;
