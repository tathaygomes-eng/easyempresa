const { query, queryOne } = require('../database/db');

exports.mensal = (req, res, next) => {
    try {
        const { mes, ano } = req.query;
        const dataRef = ano && mes ? `${ano}-${mes.padStart(2, '0')}` : new Date().toISOString().slice(0, 7);

        const inicio = `${dataRef}-01`;
        const fim = `${dataRef}-31`;

        const receitas = queryOne(`
            SELECT COALESCE(SUM(valor), 0) as total
            FROM transacoes WHERE tipo = 'receita' AND data_transacao BETWEEN ? AND ?
        `, inicio, fim);

        const despesas = queryOne(`
            SELECT COALESCE(SUM(valor), 0) as total
            FROM transacoes WHERE tipo = 'despesa' AND data_transacao BETWEEN ? AND ?
        `, inicio, fim);

        const porCategoria = query(`
            SELECT c.nome, c.cor, t.tipo, SUM(t.valor) as total
            FROM transacoes t
            JOIN categorias c ON t.categoria_id = c.id
            WHERE t.data_transacao BETWEEN ? AND ?
            GROUP BY c.id, t.tipo
            ORDER BY total DESC
        `, inicio, fim);

        const porDia = query(`
            SELECT data_transacao, tipo, SUM(valor) as total
            FROM transacoes
            WHERE data_transacao BETWEEN ? AND ?
            GROUP BY data_transacao, tipo
            ORDER BY data_transacao
        `, inicio, fim);

        res.json({
            success: true,
            data: {
                periodo: dataRef,
                receitas: receitas?.total || 0,
                despesas: despesas?.total || 0,
                saldo: (receitas?.total || 0) - (despesas?.total || 0),
                porCategoria,
                porDia
            }
        });
    } catch (err) {
        next(err);
    }
};

exports.anual = (req, res, next) => {
    try {
        const ano = req.query.ano || new Date().getFullYear();
        const inicio = `${ano}-01-01`;
        const fim = `${ano}-12-31`;

        const porMes = query(`
            SELECT
                strftime('%m', data_transacao) as mes,
                tipo,
                SUM(valor) as total
            FROM transacoes
            WHERE data_transacao BETWEEN ? AND ?
            GROUP BY mes, tipo
            ORDER BY mes
        `, inicio, fim);

        const totalReceitas = queryOne(`
            SELECT COALESCE(SUM(valor), 0) as total
            FROM transacoes WHERE tipo = 'receita' AND data_transacao BETWEEN ? AND ?
        `, inicio, fim);

        const totalDespesas = queryOne(`
            SELECT COALESCE(SUM(valor), 0) as total
            FROM transacoes WHERE tipo = 'despesa' AND data_transacao BETWEEN ? AND ?
        `, inicio, fim);

        res.json({
            success: true,
            data: {
                ano: +ano,
                totalReceitas: totalReceitas?.total || 0,
                totalDespesas: totalDespesas?.total || 0,
                saldo: (totalReceitas?.total || 0) - (totalDespesas?.total || 0),
                porMes
            }
        });
    } catch (err) {
        next(err);
    }
};

exports.porCategoria = (req, res, next) => {
    try {
        const { tipo, data_inicio, data_fim } = req.query;

        const where = ['t.categoria_id IS NOT NULL'];
        const params = [];

        if (tipo) { where.push('t.tipo = ?'); params.push(tipo); }
        if (data_inicio) { where.push('t.data_transacao >= ?'); params.push(data_inicio); }
        if (data_fim) { where.push('t.data_transacao <= ?'); params.push(data_fim); }

        const whereClause = `WHERE ${where.join(' AND ')}`;

        const data = query(`
            SELECT c.nome, c.cor, t.tipo, SUM(t.valor) as total, COUNT(*) as quantidade
            FROM transacoes t
            JOIN categorias c ON t.categoria_id = c.id
            ${whereClause}
            GROUP BY c.id
            ORDER BY total DESC
        `, ...params);

        res.json({ success: true, data });
    } catch (err) {
        next(err);
    }
};

exports.fluxoCaixa = (req, res, next) => {
    try {
        const meses = parseInt(req.query.meses) || 6;
        const dataInicio = new Date();
        dataInicio.setMonth(dataInicio.getMonth() - meses);
        const inicio = dataInicio.toISOString().slice(0, 10);

        const dadosReais = query(`
            SELECT
                strftime('%Y-%m', data_transacao) as mes,
                SUM(CASE WHEN tipo = 'receita' THEN valor ELSE 0 END) as receitas,
                SUM(CASE WHEN tipo = 'despesa' THEN valor ELSE 0 END) as despesas
            FROM transacoes
            WHERE data_transacao >= ?
            GROUP BY mes
            ORDER BY mes
        `, inicio);

        const medias = queryOne(`
            SELECT
                AVG(receitas) as media_receita,
                AVG(despesas) as media_despesa
            FROM (
                SELECT
                    strftime('%Y-%m', data_transacao) as mes,
                    SUM(CASE WHEN tipo = 'receita' THEN valor ELSE 0 END) as receitas,
                    SUM(CASE WHEN tipo = 'despesa' THEN valor ELSE 0 END) as despesas
                FROM transacoes
                WHERE data_transacao >= ?
                GROUP BY mes
            )
        `, inicio);

        const projecoes = [];
        const hoje = new Date();
        const mediaReceita = medias?.media_receita || 0;
        const mediaDespesa = medias?.media_despesa || 0;

        for (let i = 1; i <= 3; i++) {
            const data = new Date(hoje.getFullYear(), hoje.getMonth() + i, 1);
            const mes = data.toISOString().slice(0, 7);
            projecoes.push({
                mes,
                receitas: Math.round(mediaReceita * 100) / 100,
                despesas: Math.round(mediaDespesa * 100) / 100,
                projetado: true
            });
        }

        res.json({
            success: true,
            data: {
                historico: dadosReais,
                projecoes,
                medias: { receita: mediaReceita, despesa: mediaDespesa }
            }
        });
    } catch (err) {
        next(err);
    }
};

exports.pendencias = (req, res, next) => {
    try {
        const pendentes = query(`
            SELECT t.*, c.nome as categoria_nome, cl.nome as cliente_nome
            FROM transacoes t
            LEFT JOIN categorias c ON t.categoria_id = c.id
            LEFT JOIN clientes cl ON t.cliente_id = cl.id
            WHERE t.status IN ('pendente', 'atrasado')
            ORDER BY t.data_vencimento ASC
        `);

        const resumo = query(`
            SELECT
                status,
                COUNT(*) as quantidade,
                SUM(valor) as total
            FROM transacoes
            WHERE status IN ('pendente', 'atrasado')
            GROUP BY status
        `);

        res.json({ success: true, data: { pendentes, resumo } });
    } catch (err) {
        next(err);
    }
};
