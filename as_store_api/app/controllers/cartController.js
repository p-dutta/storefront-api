const db = require('../models/sequelize');
const Cart = db.Carts;
const CartItem = db.Cart_items;
const Product = db.products;
const Customer = db.customer;
const AppError = require("../utils/appError");
const ApiSuccessResponse = require("../utils/successfulApiResponse");
const redis = require('../../redis');
const { logger } = require('express-winston');

const createCart = async (req, res, next) => {
    let cart = req.body;
    const { uid } = req.userInfo;
    try {
        //exp for 7 days
        const data = await redis.set(uid + '_cart', JSON.stringify(cart), "EX", process.env.CART_EXPIRES);
        res.json(data)

    } catch (redis_err) {
        // await logger("redis-error").log("error", `Could not save token to redis`, { "error": redis_err });
        console.log(redis_err);
    }
}

const getCart = async (req, res, next) => {
    const { uid } = req.userInfo;
    try {
        let cartItems = await redis.get(uid + '_cart');
        cartItems = cartItems ? JSON.parse(cartItems) : [];
        
        let apiSuccessResponse = new ApiSuccessResponse("All Cart Items", 200, cartItems);
        apiSuccessResponse.sendResponse(res);


    } catch (error) {
        console.log(error)
    }
}


const getAllCart = async (req, res, next) => {

}


module.exports = { createCart, getAllCart, getCart }