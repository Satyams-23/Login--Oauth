const jwt = require('jsonwebtoken');

const createToken = (payload, secret, expiresTime) => {
    return jwt.sign(payload, secret, {
        expiresIn: expiresTime,
    });
};

const verifyToken = (token, secret) => {
    return jwt.verify(token, secret);
};


const jwtHelpers = {
    createToken,
    verifyToken,
};

module.exports = jwtHelpers;