const {validation} = require("../services/auhontication");
const chekForAuthenticationCookie = (cookieName) => {
    return (req, res, next) => {
        const toeknCookieValue = req.cookies[cookieName]
        if(!toeknCookieValue) {
            return next();
        }
        try {
            const userPayload = validation(toeknCookieValue);
            req.user = userPayload;
        } catch (error) {}
        return next();
    }  
}

module.exports = {
    chekForAuthenticationCookie
}