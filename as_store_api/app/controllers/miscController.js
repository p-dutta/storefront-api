const ApiSuccessResponse = require("../utils/successfulApiResponse");
//const AppError = require("../utils/appError");



const getGenders = (req, res, next) => {

    const genders = [
        {
            text: 'Male',
            slug: 'male'
        },
        {
            text: 'Female',
            slug: 'female'
        },
        {
            text: 'Other',
            slug: 'other'
        }];

    let apiSuccessResponse = new ApiSuccessResponse("All Genders.", 200, genders);
    apiSuccessResponse.sendResponse(res);


};

module.exports = {getGenders};





