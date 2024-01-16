const dotenv = require('dotenv');
const path = require('path');
const httpStatus = require('http-status');
const sendResponse = require('../helpers/response');

dotenv.config({ path: path.join(process.cwd(), '.env') });

module.exports = {
    env: process.env.NODE_ENV,
    port: process.env.PORT,
    database_url: process.env.MONGO_URL,
    password: process.env.PASSWORD,
    email: process.env.EMAIL,
    smtp_host: process.env.SMTP_HOST,
    smtp_port: process.env.SMTP_PORT,
    smtp_password: process.env.SMTP_PASSWORD,
    secret: process.env.SECRET,
    bycrypt_salt_rounds: process.env.BCRYPT_SALT_ROUNDS,
    session_secret: process.env.SESSION_SECRET,
    client_id: process.env.CLIENT_ID,
    client_secret: process.env.CLIENT_SECRET,
    googleCallbackURL: process.env.GOOGLE_CALLBACK_URL,

    jwt: {
        secret: process.env.JWT_SECRET,
        refresh_secret: process.env.JWT_REFRESH_SECRET,
        expires_in: process.env.JWT_EXPIRES_IN,
        refresh_expires_in: process.env.JWT_REFRESH_EXPIRES_IN,
    },
};
