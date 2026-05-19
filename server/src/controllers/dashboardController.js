const { query, queryOne } = require('../database/db');

exports.resumo = (req, res, next) => {
    try {
        const mesAtual = new Date().toISOString().slice(0, 7);

        const saldo = queryOne(`
            SELECT
                COALESCE(SUM(CASE WHEN tipo = 'receita' THEN valor ELSE 0 END), 0) -
                COALESCE(SUM(CASE WHEN tipo = 'despesa' THEN valor ELSE 0 END), 0) as saldo
            FROM transacoes
        `);

        const receitasMes = queryOne(`
            SELECT COALESCE(SUM(valor), 0) as total
            FROM transacoes
            WHERE tipo = 'receita' AND strftime('%Y-%m', data_transacao) = ?
        `, mesAtual);

        const despesasMes = queryOne(`
            SELECT COALESCE(SUM(valor), 0) as total
            FROM transacoes
            WHERE tipo = 'despesa' AND strftime('%Y-%m', data_transacao) = ?
        `, mesAtual);

        const pendentes = queryOne(`
            SELECT COUNT(*) as count, COALESCE(SUM(valor), 0) as total
            FROM transacoes
            WHERE status IN ('pendente', 'atrasado')
        `);

        res.json({
            success: true,
            data: {
                saldo: saldo?.saldo || 0,
                receitasMes: receitasMes?.total || 0,
                despesasMes: despesasMes?.total || 0,
                pendentes: pendentes?.count || 0,
                totalPendentes: pendentes?.total || 0
            }
        });
    } catch (err) {
        next(err);
    }
};

exports.proximosAgendamentos = (req, res, next) => {
    try {
        const hoje = new Date().toISOString().slice(0, 10);
        const agendamentos = query(`
            SELECT a.*, c.nome as cliente_nome
            FROM agendamentos a
            LEFT JOIN clientes c ON a.cliente_id = c.id
            WHERE a.data_inicio >= ? AND a.status != 'cancelado'
            ORDER BY a.data_inicio ASC
            LIMIT 5
        `, hoje);

        res.json({ success: true, data: agendamentos });
    } catch (err) {
        next(err);
    }
};

exports.transacoesRecentes = (req, res, next) => {
    try {
        const transacoes = query(`
            SELECT t.*, c.nome as categoria_nome, cl.nome as cliente_nome
            FROM transacoes t
            LEFT JOIN categorias c ON t.categoria_id = c.id
            LEFT JOIN clientes cl ON t.cliente_id = cl.id
            ORDER BY t.data_transacao DESC, t.criado_em DESC
            LIMIT 5
        `);

        res.json({ success: true, data: transacoes });
    } catch (err) {
        next(err);
    }
};
