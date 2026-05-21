const { query, queryOne, run } = require('../database/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'dev-only-fallback';

exports.registrar = (req, res, next) => {
    try {
        const { nome, email, senha } = req.body;

        if (!nome || !email || !senha) {
            return res.status(400).json({ success: false, error: { message: 'Nome, email e senha sao obrigatorios.' } });
        }

        if (senha.length < 6) {
            return res.status(400).json({ success: false, error: { message: 'A senha deve ter pelo menos 6 caracteres.' } });
        }

        const existente = queryOne('SELECT id FROM usuarios WHERE email = ?', email);
        if (existente) {
            return res.status(400).json({ success: false, error: { message: 'Este email ja esta cadastrado.' } });
        }

        const hash = bcrypt.hashSync(senha, 10);
        const result = run('INSERT INTO usuarios (nome, email, senha) VALUES (?, ?, ?)', nome, email, hash);

        // Criar config da empresa vazio para o novo usuário
        run('INSERT INTO empresa_config (user_id, nome_empresa, onboarding_completo) VALUES (?, ?, 0)', result.lastInsertRowid, '');

        const usuario = queryOne('SELECT id, nome, email, plano, criado_em FROM usuarios WHERE id = ?', result.lastInsertRowid);

        const token = jwt.sign({ id: usuario.id, email: usuario.email, plano: usuario.plano }, JWT_SECRET, { expiresIn: '7d' });

        res.status(201).json({ success: true, data: { usuario, token } });
    } catch (err) {
        next(err);
    }
};

exports.login = (req, res, next) => {
    try {
        const { email, senha } = req.body;

        if (!email || !senha) {
            return res.status(400).json({ success: false, error: { message: 'Email e senha sao obrigatorios.' } });
        }

        const usuario = queryOne('SELECT * FROM usuarios WHERE email = ? AND ativo = 1', email);
        if (!usuario) {
            return res.status(401).json({ success: false, error: { message: 'Email ou senha incorretos.' } });
        }

        const senhaValida = bcrypt.compareSync(senha, usuario.senha);
        if (!senhaValida) {
            return res.status(401).json({ success: false, error: { message: 'Email ou senha incorretos.' } });
        }

        const token = jwt.sign({ id: usuario.id, email: usuario.email, plano: usuario.plano }, JWT_SECRET, { expiresIn: '7d' });

        const { senha: _, ...usuarioSemSenha } = usuario;

        res.json({ success: true, data: { usuario: usuarioSemSenha, token } });
    } catch (err) {
        next(err);
    }
};

exports.perfil = (req, res, next) => {
    try {
        const usuario = queryOne('SELECT id, nome, email, plano, criado_em FROM usuarios WHERE id = ?', req.userId);
        if (!usuario) {
            return res.status(404).json({ success: false, error: { message: 'Usuario nao encontrado.' } });
        }
        res.json({ success: true, data: usuario });
    } catch (err) {
        next(err);
    }
};

exports.atualizarPlano = (req, res, next) => {
    try {
        const { plano } = req.body;
        if (!['basico', 'premium'].includes(plano)) {
            return res.status(400).json({ success: false, error: { message: 'Plano invalido. Escolha basico ou premium.' } });
        }

        run("UPDATE usuarios SET plano = ?, atualizado_em = datetime('now', 'localtime') WHERE id = ?", plano, req.userId);

        const usuario = queryOne('SELECT id, nome, email, plano, criado_em FROM usuarios WHERE id = ?', req.userId);

        res.json({ success: true, data: usuario });
    } catch (err) {
        next(err);
    }
};
