const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const errorHandler = require('../src/middleware/errorHandler');
const auth = require('../src/middleware/auth');
const { initDb } = require('../src/database/connection');
const { migrate, seed } = require('../src/database/migrate');

const app = express();

// Security headers
app.use(helmet());

// CORS para producao
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

// Middleware para inicializar DB em cada request (serverless)
let dbInitialized = false;

async function ensureDb(req, res, next) {
    if (!dbInitialized) {
        try {
            await initDb();
            migrate();
            seed();
            dbInitialized = true;
        } catch (err) {
            console.error('Erro ao inicializar DB:', err);
            return res.status(500).json({ success: false, error: { message: 'Erro ao inicializar servidor.' } });
        }
    }
    next();
}

app.use(ensureDb);

// Rotas publicas
app.use('/api/auth', authLimiter, require('../src/routes/auth'));

// Health check
app.get('/api/health', (req, res) => {
    res.json({ success: true, message: 'Servidor funcionando.', timestamp: new Date().toISOString() });
});

// Rotas protegidas
app.use('/api/dashboard', auth, require('../src/routes/dashboard'));
app.use('/api/categorias', auth, require('../src/routes/categorias'));
app.use('/api/clientes', auth, require('../src/routes/clientes'));
app.use('/api/transacoes', auth, require('../src/routes/transacoes'));
app.use('/api/agendamentos', auth, require('../src/routes/agendamentos'));
app.use('/api/relatorios', auth, require('../src/routes/relatorios'));
app.use('/api/empresa', require('../src/routes/empresa'));

// Error handler
app.use(errorHandler);

module.exports = app;
