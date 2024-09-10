const axios = require('axios');
require('dotenv').config()

// Create an axios instance with default headers
const axiosInstanceApiHub = axios.create({
    baseURL: process.env.BL_API_HOST,
    headers: {
        'Accept': 'application/vnd.banglalink.apihub-v1.0+json',
        'Content-Type': 'application/vnd.banglalink.apihub-v1.0+json'
    }

});

// Add an interceptor to instance1
axiosInstanceApiHub.interceptors.request.use(function (config) {
    // Add a 5 seconds timeout to all requests
    config.timeout = 5000;
    return config;
});



module.exports = axiosInstanceApiHub;