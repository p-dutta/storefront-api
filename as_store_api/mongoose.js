// Import the mongoose module
const mongoose = require("mongoose");
const mongoConfig = require("./config/mongoose.config");

const connectDB = async () => {
    try {
        //const mongoDB = "mongodb://user:password@127.0.0.1:27017/test"; //if your database has auth enabled
        const conn = await mongoose.connect(mongoConfig.URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(error.message);
        process.exit(1);
    }

    /*const db = mongoose.connection;
    db.on("error", console.error.bind(console, "connection error: "));
    db.once("open", function () {
        console.log("Connected successfully");
    });*/

}

module.exports = connectDB

