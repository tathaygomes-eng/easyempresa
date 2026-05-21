import { findOne, insert, update } from '../db/localDb';
import { seedSystemCategories } from '../db/seed';

function simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash |= 0;
    }
    return 'local_' + Math.abs(hash).toString(36);
}

function generateToken(user) {
    return btoa(JSON.stringify({ id: user.id, email: user.email, plano: user.plano, exp: Date.now() + 7 * 24 * 60 * 60 * 1000 }));
}

function getUserFromToken() {
    try {
        const token = localStorage.getItem('token');
        if (!token) return null;
        const payload = JSON.parse(atob(token));
        if (payload.exp < Date.now()) return null;
        return payload;
    } catch {
        return null;
    }
}

export function login(email, senha) {
    const user = findOne('usuarios', u => u.email === email && u.ativo === 1);
    if (!user) return Promise.reject(new Error('Email ou senha incorretos.'));
    if (user.senha !== simpleHash(senha)) return Promise.reject(new Error('Email ou senha incorretos.'));

    seedSystemCategories();

    const { senha: _, ...usuario } = user;
    const token = generateToken(user);
    return Promise.resolve({ success: true, data: { usuario, token } });
}

export function registrar(nome, email, senha) {
    if (!nome || !email || !senha) return Promise.reject(new Error('Nome, email e senha sao obrigatorios.'));
    if (senha.length < 6) return Promise.reject(new Error('A senha deve ter pelo menos 6 caracteres.'));

    const existente = findOne('usuarios', u => u.email === email);
    if (existente) return Promise.reject(new Error('Este email ja esta cadastrado.'));

    const result = insert('usuarios', {
        nome,
        email,
        senha: simpleHash(senha),
        plano: 'gratuito',
        ativo: 1
    });

    insert('empresa_config', {
        user_id: result.lastInsertRowid,
        nome_empresa: '',
        ramo_atividade: '',
        objetivo: '[]',
        onboarding_completo: 0
    });

    seedSystemCategories();

    const usuario = findOne('usuarios', u => u.id === result.lastInsertRowid);
    const { senha: _, ...usuarioSemSenha } = usuario;
    const token = generateToken(usuario);

    return Promise.resolve({ success: true, data: { usuario: usuarioSemSenha, token } });
}

export function getPerfil() {
    const payload = getUserFromToken();
    if (!payload) return Promise.reject(new Error('Sessao expirada.'));
    const user = findOne('usuarios', u => u.id === payload.id && u.ativo === 1);
    if (!user) return Promise.reject(new Error('Usuario nao encontrado.'));
    const { senha: _, ...usuario } = user;
    return Promise.resolve({ success: true, data: usuario });
}

export function atualizarPlano(plano) {
    if (!['basico', 'premium', 'gratuito'].includes(plano)) return Promise.reject(new Error('Plano invalido.'));
    const payload = getUserFromToken();
    if (!payload) return Promise.reject(new Error('Sessao expirada.'));

    update('usuarios', payload.id, { plano });
    const user = findOne('usuarios', u => u.id === payload.id);
    const { senha: _, ...usuario } = user;

    localStorage.setItem('usuario', JSON.stringify(usuario));
    const token = generateToken(user);
    localStorage.setItem('token', token);

    return Promise.resolve({ success: true, data: usuario });
}
