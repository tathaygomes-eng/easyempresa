const { query, queryOne, run } = require('../database/db');

exports.listar = (req, res, next) => {
    try {
        const { data_inicio, data_fim, cliente_id, status } = req.query;

        const where = [];
        const params = [];

        if (data_inicio) { where.push('a.data_inicio >= ?'); params.push(data_inicio); }
        if (data_fim) { where.push('a.data_inicio <= ?'); params.push(data_fim); }
        if (cliente_id) { where.push('a.cliente_id = ?'); params.push(cliente_id); }
        if (status) { where.push('a.status = ?'); params.push(status); }

        const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : '';

        const data = query(`
            SELECT a.*, c.nome as cliente_nome
            FROM agendamentos a
            LEFT JOIN clientes c ON a.cliente_id = c.id
            ${whereClause}
            ORDER BY a.data_inicio ASC
        `, ...params);

        res.json({ success: true, data });
    } catch (err) {
        next(err);
    }
};

exports.detalhes = (req, res, next) => {
    try {
        const { id } = req.params;
        const agendamento = queryOne(`
            SELECT a.*, c.nome as cliente_nome
            FROM agendamentos a
            LEFT JOIN clientes c ON a.cliente_id = c.id
            WHERE a.id = ?
        `, id);

        if (!agendamento) {
            return res.status(404).json({ success: false, error: { message: 'Agendamento nao encontrado.' } });
        }

        res.json({ success: true, data: agendamento });
    } catch (err) {
        next(err);
    }
};

exports.criar = (req, res, next) => {
    try {
        const { titulo, descricao, data_inicio, data_fim, dia_inteiro, cliente_id, local, status, lembrete, lembrete_minutos, cor } = req.body;

        if (!titulo || !data_inicio || !data_fim) {
            return res.status(400).json({ success: false, error: { message: 'Titulo, data inicio e data fim sao obrigatorios.' } });
        }

        const result = run(
            'INSERT INTO agendamentos (titulo, descricao, data_inicio, data_fim, dia_inteiro, cliente_id, local, status, lembrete, lembrete_minutos, cor) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            titulo, descricao, data_inicio, data_fim, dia_inteiro || 0, cliente_id || null, local, status || 'agendado', lembrete !== undefined ? lembrete : 1, lembrete_minutos || 30, cor || '#3B82F6'
        );

        const agendamento = queryOne(`
            SELECT a.*, c.nome as cliente_nome
            FROM agendamentos a
            LEFT JOIN clientes c ON a.cliente_id = c.id
            WHERE a.id = ?
        `, result.lastInsertRowid);

        res.status(201).json({ success: true, data: agendamento });
    } catch (err) {
        next(err);
    }
};

exports.atualizar = (req, res, next) => {
    try {
        const { id } = req.params;
        const { titulo, descricao, data_inicio, data_fim, dia_inteiro, cliente_id, local, status, lembrete, lembrete_minutos, cor } = req.body;

        run(
            "UPDATE agendamentos SET titulo = ?, descricao = ?, data_inicio = ?, data_fim = ?, dia_inteiro = ?, cliente_id = ?, local = ?, status = ?, lembrete = ?, lembrete_minutos = ?, cor = ?, atualizado_em = datetime('now', 'localtime') WHERE id = ?",
            titulo, descricao, data_inicio, data_fim, dia_inteiro, cliente_id || null, local, status, lembrete, lembrete_minutos, cor, id
        );

        const agendamento = queryOne(`
            SELECT a.*, c.nome as cliente_nome
            FROM agendamentos a
            LEFT JOIN clientes c ON a.cliente_id = c.id
            WHERE a.id = ?
        `, id);

        res.json({ success: true, data: agendamento });
    } catch (err) {
        next(err);
    }
};

exports.excluir = (req, res, next) => {
    try {
        const { id } = req.params;
        run('DELETE FROM agendamentos WHERE id = ?', id);
        res.json({ success: true, message: 'Agendamento excluido.' });
    } catch (err) {
        next(err);
    }
};

exports.alterarStatus = (req, res, next) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!['agendado', 'confirmado', 'concluido', 'cancelado'].includes(status)) {
            return res.status(400).json({ success: false, error: { message: 'Status invalido.' } });
        }

        run("UPDATE agendamentos SET status = ?, atualizado_em = datetime('now', 'localtime') WHERE id = ?", status, id);

        const agendamento = queryOne('SELECT * FROM agendamentos WHERE id = ?', id);

        res.json({ success: true, data: agendamento });
    } catch (err) {
        next(err);
    }
};

exports.lembretes = (req, res, next) => {
    try {
        const agora = new Date().toISOString();
        const em30min = new Date(Date.now() + 30 * 60 * 1000).toISOString();

        const agendamentos = query(`
            SELECT a.*, c.nome as cliente_nome
            FROM agendamentos a
            LEFT JOIN clientes c ON a.cliente_id = c.id
            WHERE a.lembrete = 1
            AND a.data_inicio BETWEEN ? AND ?
            AND a.status IN ('agendado', 'confirmado')
            ORDER BY a.data_inicio ASC
        `, agora, em30min);

        res.json({ success: true, data: agendamentos });
    } catch (err) {
        next(err);
    }
};
