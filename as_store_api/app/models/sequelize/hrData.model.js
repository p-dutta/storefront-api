
module.exports = (sequelize,DataTypes) =>{
    const HrData = sequelize.define('hr_data', {
        id: {
            type: DataTypes.BIGINT,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
        },
        name: {
            type: DataTypes.TEXT,
        },
        phone: {
            type: DataTypes.TEXT,
        },
        join_date: {
            type: DataTypes.DATE,
        },
        // company_id: {
        //     type: DataTypes.INTEGER,
        // },
        emp_id: {
            type: DataTypes.TEXT,
        },
        created_at: {
            type: DataTypes.DATE,
        },
        updated_at: {
            type: DataTypes.DATE,
        },
    }, {
        timestamps: false, // If you want to manage timestamps yourself
        underscored: true, // Use snake_case for column names (if your database uses it)
        tableName: 'hr_data', // Specify the table name if it's different from the model name
    });
return HrData
}


// HrData.sync();

// module.exports = HrData;
