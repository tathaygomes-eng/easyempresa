import { insert, update, remove, findById, find } from '../db/localDb';

function getCurrentUserId() {
    try {
        const user = JSON.parse(localStorage.getItem('usuario'));
        return user?.id;
    } catch {
        return null;
    }
}

export function listarTransacoes(params = {}) {
    const userId = getCurrentUserId();
    let transacoes = find('transacoes', t => t.user_id === userId);

    if (params.tipo) transacoes = transacoes.filter(t => t.tipo === params.tipo);
    if (params.status) transacoes = transacoes.filter(t => t.status === params.status);
    if (params.categoria_id) transacoes = transacoes.filter(t => t.categoria_id === Number(params.categoria_id));
    if (params.cliente_id) transacoes = transacoes.filter(t => t.cliente_id === Number(params.cliente_id));
    if (params.data_inicio) transacoes = transacoes.filter(t => t.data_transacao >= params.data_inicio);
    if (params.data_fim) transacoes = transacoes.filter(t => t.data_transacao <= params.data_fim);

    const total = transacoes.length;
    const page = parseInt(params.page) || 1;
    const limit = parseInt(params.limit) || 20;
    const offset = (page - 1) * limit;

    transacoes.sort((a, b) => (b.data_transacao + b.criado_em).localeCompare(a.data_transacao + a.criado_em));

    const categorias = find('categorias', () => true);
    const clientes = find('clientes', () => true);

    const paginated = transacoes.slice(offset, offset + limit).map(t => ({
        ...t,
        categoria_nome: categorias.find(c => c.id === t.categoria_id)?.nome || null,
        cliente_nome: clientes.find(cl => cl.id === t.cliente_id)?.nome || null
    }));

    return Promise.resolve({
        success: true,
        data: paginated,
        pagination: { page, limit, total, pages: Math.ceil(total / limit) }
    });
}

export function getTransacao(id) {
    const t = findById('transacoes', id);
    if (!t) return Promise.reject(new Error('Transacao nao encontrada.'));
    const cat = findById('categorias', t.categoria_id);
    const cli = findById('clientes', t.cliente_id);
    return Promise.resolve({ success: true, data: { ...t, categoria_nome: cat?.nome, cliente_nome: cli?.nome } });
}

export function criarTransacao(data) {
    const userId = getCurrentUserId();
    const result = insert('transacoes', {
        tipo: data.tipo,
        descricao: data.descricao,
        valor: Number(data.valor),
        data_transacao: data.data_transacao,
        data_vencimento: data.data_vencimento || null,
        status: data.status || 'pendente',
        categoria_id: data.categoria_id ? Number(data.categoria_id) : null,
        cliente_id: data.cliente_id ? Number(data.cliente_id) : null,
        forma_pagamento: data.forma_pagamento || null,
        observacoes: data.observacoes || null,
        recorrente: data.recorrente ? 1 : 0,
        recorrencia_tipo: data.recorrencia_tipo || null,
        user_id: userId
    });
    return Promise.resolve({ success: true, data: { id: result.lastInsertRowid, ...data } });
}

export function atualizarTransacao(id, data) {
    update('transacoes', id, data);
    return Promise.resolve({ success: true });
}

export function excluirTransacao(id) {
    remove('transacoes', id);
    return Promise.resolve({ success: true });
}

export function alterarStatusTransacao(id, status) {
    update('transacoes', id, { status });
    return Promise.resolve({ success: true });
}
