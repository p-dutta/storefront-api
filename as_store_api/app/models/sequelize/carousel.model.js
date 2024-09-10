
module.exports = (sequelize, DataTypes) => {
    const Carousel = sequelize.define("carousel", {
            id: {
                type: DataTypes.BIGINT,
                primaryKey: true,
                autoIncrement: true,
            },
            image_url: {
                type: DataTypes.STRING(255),
                allowNull: false,
            },
            app_location: {
                type: DataTypes.STRING(255),
                allowNull: false,
            },
            for_application: {
                type: DataTypes.STRING(255),
                allowNull: false,
            },
            status: {
                type: DataTypes.BOOLEAN,
                defaultValue: true,
                allowNull: false,
            },
            priority: {
                type: DataTypes.BIGINT,
                defaultValue: 0,
                allowNull: false,
            },
            short_desc: {
                type: DataTypes.STRING(255),
            },
            icon: {
                type: DataTypes.STRING(255),
            },
            created_at: {
                type: DataTypes.DATE,
            },
            updated_at: {
                type: DataTypes.DATE,
            },
        },
        {
            freezeTableName: true,
            timestamps: false
        },
    );
    return Carousel
}