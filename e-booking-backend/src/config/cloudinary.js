import cloudinary from 'cloudinary';
import dotenv from 'dotenv';
dotenv.config();

const {CLOUDINARY_NAME,
CLOUDINARY_API_KEY,
CLOUDINARY_API_SECRET} = process.env;

const cloudiaryConfig = {
    cloud_name: CLOUDINARY_NAME,
    api_key: CLOUDINARY_API_KEY,
    api_secret: CLOUDINARY_API_SECRET
};

cloudinary.config(cloudiaryConfig);
module.exports = cloudinary