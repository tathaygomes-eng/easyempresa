const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
    console.error('AVISO: JWT_SECRET nao definido. Defina a variavel de ambiente JWT_SECRET.');
}

function auth(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ success: false, error: { message: 'Token nao fornecido.' } });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, JWT_SECRET || 'dev-only-fallback');
        req.userId = decoded.id;
        req.userPlano = decoded.plano;
        next();
    } catch (err) {
        return res.status(401).json({ success: false, error: { message: 'Token invalido ou expirado.' } });
    }
}

module.exports = auth;
