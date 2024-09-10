

module.exports = (sequelize,DataTypes) =>{
    const CustomerDigitalServices = sequelize.define("customer_digital_services", {
    
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        subscribed_services: {
            type: DataTypes.JSON
        }
    
    },
        {
            freezeTableName: true,   // do not pluralize the table name
            timestamps: true,
            createdAt: "created_at", // alias createdAt as created_at
            updatedAt: "updated_at", // alias updatedAt as updated_at
    
        },
    
    );
return CustomerDigitalServices
}

// CustomerDigitalServices.sync();

// module.exports = CustomerDigitalServices;
