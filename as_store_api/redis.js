const Redis = require('ioredis');
require('dotenv').config();

//const redisClient = redis.createClient(process.env.REDIS_PORT, process.env.REDIS_HOST);


const redis = new Redis({
    port: process.env.REDIS_PORT,
    host: process.env.REDIS_HOST,
    username: process.env.REDIS_USERNAME, // uncomment these two lines while on local
    password: process.env.REDIS_PASSWORD
});


/*
redisClient.set('mykey', 'myvalue').then(() => {
    console.log('Key set in Redis');
}).catch((err) => {
    console.error('Error setting key in Redis:', err);
});
*/

module.exports = redis;
