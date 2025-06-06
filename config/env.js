import dotenv from 'dotenv';
dotenv.config();

const ENV = {
    ACCESS_KEY: process.env.ACCESS_KEY,
    SECRET_KEY: process.env.SECRET_KEY,
    CLIENT_ID: process.env.CLIENT_ID,
    TP_BASE_URL: process.env.TP_BASE_URL
}

export { ENV}