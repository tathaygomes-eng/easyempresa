require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const errorHandler = require('./middleware/errorHandler');
const auth = require('./middleware/auth');
const { initDb } = require('./database/connection');
const { migrate, seed } = require('./database/migrate');

const app = express();

// Security headers
app.use(helmet());

// CORS restrito
const allowedOrigins = process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',').map(o => o.trim())
    : ['http://localhost:5173', 'http://localhost:3000'];

app.use(cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body size limit
app.use(express.json({ limit: '1mb' }));

// Rate limiting global
const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, error: { message: 'Muitas requisicoes. Tente novamente mais tarde.' } }
});
app.use('/api/', globalLimiter);

// Rate limiting stricto para auth
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 15,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, error: { message: 'Muitas tentativas de login. Aguarde 15 minutos.' } }
});

// Inicializar banco e iniciar servidor
async function start() {
    await initDb();
    console.log('Banco de dados inicializado.');

    migrate();
    seed();

    // Rotas publicas (nao precisam de autenticacao)
    app.use('/api/auth', authLimiter, require('./routes/auth'));

    // Health check
    app.get('/api/health', (req, res) => {
        res.json({ success: true, message: 'Servidor funcionando.', timestamp: new Date().toISOString() });
    });

    // Rotas protegidas (precisam de autenticacao)
    app.use('/api/dashboard', auth, require('./routes/dashboard'));
    app.use('/api/categorias', auth, require('./routes/categorias'));
    app.use('/api/clientes', auth, require('./routes/clientes'));
    app.use('/api/transacoes', auth, require('./routes/transacoes'));
    app.use('/api/agendamentos', auth, require('./routes/agendamentos'));
    app.use('/api/relatorios', auth, require('./routes/relatorios'));
    app.use('/api/empresa', require('./routes/empresa'));

    // Error handler
    app.use(errorHandler);

    const PORT = process.env.PORT || 3001;
    app.listen(PORT, () => {
        console.log(`Servidor rodando na porta ${PORT}`);
    });
}

start().catch(err => {
    console.error('Erro ao iniciar servidor:', err);
    process.exit(1);
});

module.exports = app;
