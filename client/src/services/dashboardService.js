import { find, findAll } from '../db/localDb';

function getCurrentUserId() {
    try {
        const user = JSON.parse(localStorage.getItem('usuario'));
        return user?.id;
    } catch {
        return null;
    }
}

export function getResumo() {
    const userId = getCurrentUserId();
    const transacoes = find('transacoes', t => t.user_id === userId);
    const hoje = new Date().toISOString().slice(0, 7);

    const saldo = transacoes.reduce((acc, t) => {
        return acc + (t.tipo === 'receita' ? t.valor : -t.valor);
    }, 0);

    const receitasMes = transacoes
        .filter(t => t.tipo === 'receita' && t.data_transacao?.startsWith(hoje))
        .reduce((acc, t) => acc + t.valor, 0);

    const despesasMes = transacoes
        .filter(t => t.tipo === 'despesa' && t.data_transacao?.startsWith(hoje))
        .reduce((acc, t) => acc + t.valor, 0);

    const pendentesArr = transacoes.filter(t => t.status === 'pendente' || t.status === 'atrasado');

    return Promise.resolve({
        success: true,
        data: {
            saldo,
            receitasMes,
            despesasMes,
            pendentes: pendentesArr.length,
            totalPendentes: pendentesArr.reduce((acc, t) => acc + t.valor, 0)
        }
    });
}

export function getProximosAgendamentos() {
    const userId = getCurrentUserId();
    const hoje = new Date().toISOString().slice(0, 10);
    const clientes = findAll('clientes');

    const agendamentos = find('agendamentos', a =>
        a.user_id === userId && a.data_inicio >= hoje && a.status !== 'cancelado'
    ).sort((a, b) => a.data_inicio.localeCompare(b.data_inicio)).slice(0, 5);

    const data = agendamentos.map(a => ({
        ...a,
        cliente_nome: clientes.find(c => c.id === a.cliente_id)?.nome || null
    }));

    return Promise.resolve({ success: true, data });
}

export function getTransacoesRecentes() {
    const userId = getCurrentUserId();
    const categorias = findAll('categorias');
    const clientes = findAll('clientes');

    const transacoes = find('transacoes', t => t.user_id === userId)
        .sort((a, b) => (b.data_transacao + b.criado_em).localeCompare(a.data_transacao + a.criado_em))
        .slice(0, 5);

    const data = transacoes.map(t => ({
        ...t,
        categoria_nome: categorias.find(c => c.id === t.categoria_id)?.nome || null,
        cliente_nome: clientes.find(c => c.id === t.cliente_id)?.nome || null
    }));

    return Promise.resolve({ success: true, data });
}
