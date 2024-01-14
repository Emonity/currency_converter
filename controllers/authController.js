const jwt = require('jsonwebtoken');
const secretKey = 'myKey'; // ключ для токена
/**
 * Функция проверки токена
 * @param req
 * @param res
 * @param next
 * @returns {*}
 */
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]
    if (token == null) return res.sendStatus(401);
    jwt.verify(token, secretKey, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
}

module.exports = authenticateToken;