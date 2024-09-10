const { Schema, model } = require("mongoose");
const moment = require("moment");

const ProductSchema = new Schema(
    {
        any: {}
    },
    {
        //timestamps: { currentTime: () => Date.now() },
        //timestamps: { currentTime: () => moment(currentTime).format("YYYY-MM-DD HH:mm:ss") },
        timestamps: true,
    }
);

// Custom getter function to format the datetime fields
ProductSchema.path('createdAt').get(function (value) {
    return value ? moment(value).format('YYYY-MM-DD HH:mm:ss') : value;
});

ProductSchema.path('updatedAt').get(function (value) {
    return value ? moment(value).format('YYYY-MM-DD HH:mm:ss') : value;
});


const Product = model("Product", ProductSchema)

module.exports = Product