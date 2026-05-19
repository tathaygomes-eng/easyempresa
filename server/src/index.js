require('dotenv').config();
const express = require('express');
const cors = require('cors');
const errorHandler = require('./middleware/errorHandler');
const auth = require('./middleware/auth');
const { initDb } = require('./database/connection');
const { migrate, seed } = require('./database/migrate');

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(cors());
app.use(express.json());

// Inicializar banco e iniciar servidor
async function start() {
    await initDb();
    console.log('Banco de dados inicializado.');

    migrate();
    seed();

    // Rotas publicas (nao precisam de autenticacao)
    app.use('/api/auth', require('./routes/auth'));

    // Health check
    app.get('/api/health', (req, res) => {
        res.json({ success: true, message: 'Servidor funcionando.' });
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

    app.listen(PORT, () => {
        console.log(`Servidor rodando na porta ${PORT}`);
    });
}

start().catch(err => {
    console.error('Erro ao iniciar servidor:', err);
    process.exit(1);
});
