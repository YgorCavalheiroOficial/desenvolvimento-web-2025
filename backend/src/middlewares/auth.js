import jwt from 'jsonwebtoken';

// Middleware principal para verificar o token JWT e extrair o usuário
export const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ erro: 'Acesso negado. Token não fornecido.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        // Adiciona o payload do token ao objeto 'req'
        req.user = decoded; 
        
        next();
    } catch (error) {
        return res.status(403).json({ erro: 'Token inválido ou expirado.' });
    }
};

// Função para verificar se o usuário tem o perfil necessário
export const authorizeRole = (role) => (req, res, next) => {
    if (req.user && req.user.role === role) {
        return next(); // Autorizado
    }
    return res.status(403).json({ erro: `Acesso negado. Requer perfil de ${role}.` }); // 403 Forbidden
};