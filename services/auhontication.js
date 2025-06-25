const jwt = require("jsonwebtoken");
const secret = "meet366105"

const cratetokenForUser = async (user) => {
    const payload = {
        _id: user._id,
        firstName: user.firstName,
        email: user.email,
        photo: user.photo,
        role: user.role,
    };
    const token = jwt.sign(payload, secret);
    return token;
}

const validation = (token) => {
    const payload = jwt.verify(token, secret);
    return payload;
}

module.exports = {
    cratetokenForUser,
    validation,
}