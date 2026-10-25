const jwt = require('jsonwebtoken');

function requireAuth(req, res, next) {
    const authorization = req.get('authorization');
    const token = authorization && authorization.startsWith('Bearer ')
        ? authorization.slice(7)
        : null;

    if (!token) {
        return res.status(401).json({ pesan: 'Token autentikasi wajib disertakan.' });
    }

    try {
        req.user = jwt.verify(token, process.env.JWT_SECRET);
        return next();
    } catch {
        return res.status(401).json({ pesan: 'Token autentikasi tidak valid atau sudah kedaluwarsa.' });
    }
}

function requireRole(...roles) {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({ pesan: 'Anda tidak memiliki izin untuk melakukan aksi ini.' });
        }
        return next();
    };
}

module.exports = { requireAuth, requireRole };
