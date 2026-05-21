import { insert, update, softDelete, findById, find } from '../db/localDb';

function getCurrentUserId() {
    try {
        const user = JSON.parse(localStorage.getItem('usuario'));
        return user?.id;
    } catch {
        return null;
    }
}

export function listarClientes(params = {}) {
    const userId = getCurrentUserId();
    let clientes = find('clientes', c => c.user_id === userId && c.ativo !== 0);

    if (params.search) {
        const term = params.search.toLowerCase();
        clientes = clientes.filter(c =>
            (c.nome && c.nome.toLowerCase().includes(term)) ||
            (c.email && c.email.toLowerCase().includes(term)) ||
            (c.telefone && c.telefone.includes(term))
        );
    }

    const total = clientes.length;
    const page = parseInt(params.page) || 1;
    const limit = parseInt(params.limit) || 20;
    const offset = (page - 1) * limit;

    clientes.sort((a, b) => b.criado_em.localeCompare(a.criado_em));
    clientes = clientes.slice(offset, offset + limit);

    return Promise.resolve({
        success: true,
        data: clientes,
        pagination: { page, limit, total, pages: Math.ceil(total / limit) }
    });
}

export function getCliente(id) {
    const cliente = findById('clientes', id);
    if (!cliente) return Promise.reject(new Error('Cliente nao encontrado.'));
    const interacoes = find('interacoes', i => i.cliente_id === id)
        .sort((a, b) => b.data_interacao.localeCompare(a.data_interacao))
        .slice(0, 10);
    return Promise.resolve({ success: true, data: { ...cliente, interacoes } });
}

export function criarCliente(data) {
    const userId = getCurrentUserId();
    const result = insert('clientes', { ...data, ativo: 1, user_id: userId });
    return Promise.resolve({ success: true, data: { id: result.lastInsertRowid, ...data } });
}

export function atualizarCliente(id, data) {
    update('clientes', id, data);
    return Promise.resolve({ success: true });
}

export function desativarCliente(id) {
    softDelete('clientes', id);
    return Promise.resolve({ success: true });
}

export function listarInteracoes(clienteId) {
    const interacoes = find('interacoes', i => i.cliente_id === clienteId)
        .sort((a, b) => b.data_interacao.localeCompare(a.data_interacao));
    return Promise.resolve({ success: true, data: interacoes });
}

export function criarInteracao(clienteId, data) {
    const userId = getCurrentUserId();
    const result = insert('interacoes', {
        cliente_id: clienteId,
        tipo: data.tipo,
        descricao: data.descricao,
        data_interacao: data.data_interacao || new Date().toISOString().slice(0, 19).replace('T', ' '),
        user_id: userId
    });
    return Promise.resolve({ success: true, data: { id: result.lastInsertRowid, ...data, cliente_id: clienteId } });
}

export function listarTransacoesCliente(clienteId) {
    const categorias = find('categorias', () => true);
    const transacoes = find('transacoes', t => t.cliente_id === clienteId)
        .sort((a, b) => b.data_transacao.localeCompare(a.data_transacao));

    const data = transacoes.map(t => ({
        ...t,
        categoria_nome: categorias.find(c => c.id === t.categoria_id)?.nome || null
    }));

    return Promise.resolve({ success: true, data });
}
