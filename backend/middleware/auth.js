const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(403).json({ message: "Access Denied: No Token Provided" });

    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        req.user = verified;
        next();
    } catch (err) {
        res.status(401).json({ message: "Invalid Token" });
    }
};

const authorizeRoles = (allowedRoles) => {
    return (req, res, next) => {
        if (allowedRoles.includes(req.user.role) || req.user.role === 'Admin') {
            next();
        } else {
            res.status(403).json({ message: "Forbidden: Insufficient Permissions" });
        }
    };
};

module.exports = { verifyToken, authorizeRoles };
