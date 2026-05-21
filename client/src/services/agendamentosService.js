import { insert, update, remove, findById, find } from '../db/localDb';

function getCurrentUserId() {
    try {
        const user = JSON.parse(localStorage.getItem('usuario'));
        return user?.id;
    } catch {
        return null;
    }
}

export function listarAgendamentos(params = {}) {
    const userId = getCurrentUserId();
    let agendamentos = find('agendamentos', a => a.user_id === userId);

    if (params.data_inicio) agendamentos = agendamentos.filter(a => a.data_inicio >= params.data_inicio);
    if (params.data_fim) agendamentos = agendamentos.filter(a => a.data_inicio <= params.data_fim);
    if (params.cliente_id) agendamentos = agendamentos.filter(a => a.cliente_id === Number(params.cliente_id));
    if (params.status) agendamentos = agendamentos.filter(a => a.status === params.status);

    const clientes = find('clientes', () => true);

    agendamentos = agendamentos.map(a => ({
        ...a,
        cliente_nome: clientes.find(c => c.id === a.cliente_id)?.nome || null
    }));

    agendamentos.sort((a, b) => a.data_inicio.localeCompare(b.data_inicio));

    return Promise.resolve({ success: true, data: agendamentos });
}

export function getAgendamento(id) {
    const a = findById('agendamentos', id);
    if (!a) return Promise.reject(new Error('Agendamento nao encontrado.'));
    const cli = findById('clientes', a.cliente_id);
    return Promise.resolve({ success: true, data: { ...a, cliente_nome: cli?.nome } });
}

export function criarAgendamento(data) {
    const userId = getCurrentUserId();
    const result = insert('agendamentos', {
        titulo: data.titulo,
        descricao: data.descricao || null,
        data_inicio: data.data_inicio,
        data_fim: data.data_fim,
        dia_inteiro: data.dia_inteiro ? 1 : 0,
        cliente_id: data.cliente_id ? Number(data.cliente_id) : null,
        local: data.local || null,
        status: data.status || 'agendado',
        lembrete: data.lembrete !== undefined ? (data.lembrete ? 1 : 0) : 1,
        lembrete_minutos: data.lembrete_minutos || 30,
        cor: data.cor || '#3B82F6',
        recorrente: data.recorrente ? 1 : 0,
        user_id: userId
    });
    return Promise.resolve({ success: true, data: { id: result.lastInsertRowid, ...data } });
}

export function atualizarAgendamento(id, data) {
    update('agendamentos', id, data);
    return Promise.resolve({ success: true });
}

export function excluirAgendamento(id) {
    remove('agendamentos', id);
    return Promise.resolve({ success: true });
}

export function alterarStatusAgendamento(id, status) {
    update('agendamentos', id, { status });
    return Promise.resolve({ success: true });
}

export function getLembretes() {
    const userId = getCurrentUserId();
    const agora = new Date();
    const em30min = new Date(agora.getTime() + 30 * 60000).toISOString().slice(0, 16);

    const lembretes = find('agendamentos', a =>
        a.user_id === userId &&
        a.lembrete === 1 &&
        a.status !== 'cancelado' &&
        a.data_inicio <= em30min &&
        a.data_inicio >= agora.toISOString().slice(0, 16)
    );

    return Promise.resolve({ success: true, data: lembretes });
}
