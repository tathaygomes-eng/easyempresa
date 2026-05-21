const { query, queryOne, run } = require('../database/db');

exports.listar = (req, res, next) => {
    try {
        const { tipo, status, categoria_id, cliente_id, data_inicio, data_fim, page = 1, limit = 20 } = req.query;
        const offset = (page - 1) * limit;

        const where = ['t.user_id = ?'];
        const params = [req.userId];

        if (tipo) { where.push('t.tipo = ?'); params.push(tipo); }
        if (status) { where.push('t.status = ?'); params.push(status); }
        if (categoria_id) { where.push('t.categoria_id = ?'); params.push(categoria_id); }
        if (cliente_id) { where.push('t.cliente_id = ?'); params.push(cliente_id); }
        if (data_inicio) { where.push('t.data_transacao >= ?'); params.push(data_inicio); }
        if (data_fim) { where.push('t.data_transacao <= ?'); params.push(data_fim); }

        const whereClause = `WHERE ${where.join(' AND ')}`;

        const totalResult = queryOne(`SELECT COUNT(*) as count FROM transacoes t ${whereClause}`, ...params);
        const total = totalResult?.count || 0;

        const data = query(`
            SELECT t.*, c.nome as categoria_nome, cl.nome as cliente_nome
            FROM transacoes t
            LEFT JOIN categorias c ON t.categoria_id = c.id
            LEFT JOIN clientes cl ON t.cliente_id = cl.id
            ${whereClause}
            ORDER BY t.data_transacao DESC, t.criado_em DESC
            LIMIT ? OFFSET ?
        `, ...params, +limit, +offset);

        res.json({
            success: true,
            data,
            pagination: { page: +page, limit: +limit, total, totalPages: Math.ceil(total / limit) }
        });
    } catch (err) {
        next(err);
    }
};

exports.detalhes = (req, res, next) => {
    try {
        const { id } = req.params;
        const transacao = queryOne(`
            SELECT t.*, c.nome as categoria_nome, cl.nome as cliente_nome
            FROM transacoes t
            LEFT JOIN categorias c ON t.categoria_id = c.id
            LEFT JOIN clientes cl ON t.cliente_id = cl.id
            WHERE t.id = ? AND t.user_id = ?
        `, id, req.userId);

        if (!transacao) {
            return res.status(404).json({ success: false, error: { message: 'Transacao nao encontrada.' } });
        }

        res.json({ success: true, data: transacao });
    } catch (err) {
        next(err);
    }
};

exports.criar = (req, res, next) => {
    try {
        const { tipo, descricao, valor, data_transacao, data_vencimento, status, categoria_id, cliente_id, forma_pagamento, observacoes, recorrente, recorrencia_tipo } = req.body;

        if (!tipo || !descricao || !valor || !data_transacao) {
            return res.status(400).json({ success: false, error: { message: 'Tipo, descricao, valor e data sao obrigatorios.' } });
        }

        const result = run(
            'INSERT INTO transacoes (tipo, descricao, valor, data_transacao, data_vencimento, status, categoria_id, cliente_id, forma_pagamento, observacoes, recorrente, recorrencia_tipo, user_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            tipo, descricao, valor, data_transacao, data_vencimento, status || 'pendente', categoria_id || null, cliente_id || null, forma_pagamento, observacoes, recorrente || 0, recorrencia_tipo, req.userId
        );

        const transacao = queryOne(`
            SELECT t.*, c.nome as categoria_nome, cl.nome as cliente_nome
            FROM transacoes t
            LEFT JOIN categorias c ON t.categoria_id = c.id
            LEFT JOIN clientes cl ON t.cliente_id = cl.id
            WHERE t.id = ?
        `, result.lastInsertRowid);

        res.status(201).json({ success: true, data: transacao });
    } catch (err) {
        next(err);
    }
};

exports.atualizar = (req, res, next) => {
    try {
        const { id } = req.params;
        const { tipo, descricao, valor, data_transacao, data_vencimento, status, categoria_id, cliente_id, forma_pagamento, observacoes, recorrente, recorrencia_tipo } = req.body;

        const existing = queryOne('SELECT id FROM transacoes WHERE id = ? AND user_id = ?', id, req.userId);
        if (!existing) {
            return res.status(404).json({ success: false, error: { message: 'Transacao nao encontrada.' } });
        }

        run(
            "UPDATE transacoes SET tipo = ?, descricao = ?, valor = ?, data_transacao = ?, data_vencimento = ?, status = ?, categoria_id = ?, cliente_id = ?, forma_pagamento = ?, observacoes = ?, recorrente = ?, recorrencia_tipo = ?, atualizado_em = datetime('now', 'localtime') WHERE id = ? AND user_id = ?",
            tipo, descricao, valor, data_transacao, data_vencimento, status, categoria_id || null, cliente_id || null, forma_pagamento, observacoes, recorrente, recorrencia_tipo, id, req.userId
        );

        const transacao = queryOne(`
            SELECT t.*, c.nome as categoria_nome, cl.nome as cliente_nome
            FROM transacoes t
            LEFT JOIN categorias c ON t.categoria_id = c.id
            LEFT JOIN clientes cl ON t.cliente_id = cl.id
            WHERE t.id = ?
        `, id);

        res.json({ success: true, data: transacao });
    } catch (err) {
        next(err);
    }
};

exports.excluir = (req, res, next) => {
    try {
        const { id } = req.params;
        const existing = queryOne('SELECT id FROM transacoes WHERE id = ? AND user_id = ?', id, req.userId);
        if (!existing) {
            return res.status(404).json({ success: false, error: { message: 'Transacao nao encontrada.' } });
        }
        run('DELETE FROM transacoes WHERE id = ? AND user_id = ?', id, req.userId);
        res.json({ success: true, message: 'Transacao excluida.' });
    } catch (err) {
        next(err);
    }
};

exports.alterarStatus = (req, res, next) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!['pago', 'pendente', 'atrasado'].includes(status)) {
            return res.status(400).json({ success: false, error: { message: 'Status invalido.' } });
        }

        const existing = queryOne('SELECT id FROM transacoes WHERE id = ? AND user_id = ?', id, req.userId);
        if (!existing) {
            return res.status(404).json({ success: false, error: { message: 'Transacao nao encontrada.' } });
        }

        run("UPDATE transacoes SET status = ?, atualizado_em = datetime('now', 'localtime') WHERE id = ? AND user_id = ?", status, id, req.userId);

        const transacao = queryOne('SELECT * FROM transacoes WHERE id = ?', id);

        res.json({ success: true, data: transacao });
    } catch (err) {
        next(err);
    }
};
