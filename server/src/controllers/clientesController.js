const { query, queryOne, run } = require('../database/db');

exports.listar = (req, res, next) => {
    try {
        const { search = '', page = 1, limit = 20, ativo = 1 } = req.query;
        const offset = (page - 1) * limit;

        const where = ['ativo = ?', 'user_id = ?'];
        const params = [ativo, req.userId];

        if (search) {
            where.push('(nome LIKE ? OR email LIKE ? OR telefone LIKE ?)');
            const term = `%${search}%`;
            params.push(term, term, term);
        }

        const whereClause = `WHERE ${where.join(' AND ')}`;

        const totalResult = queryOne(`SELECT COUNT(*) as count FROM clientes ${whereClause}`, ...params);
        const total = totalResult?.count || 0;
        const data = query(`SELECT * FROM clientes ${whereClause} ORDER BY nome LIMIT ? OFFSET ?`, ...params, +limit, +offset);

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
        const cliente = queryOne('SELECT * FROM clientes WHERE id = ? AND ativo = 1 AND user_id = ?', id, req.userId);

        if (!cliente) {
            return res.status(404).json({ success: false, error: { message: 'Cliente nao encontrado.' } });
        }

        const interacoes = query('SELECT * FROM interacoes WHERE cliente_id = ? AND user_id = ? ORDER BY data_interacao DESC LIMIT 10', id, req.userId);

        res.json({ success: true, data: { ...cliente, interacoes } });
    } catch (err) {
        next(err);
    }
};

exports.criar = (req, res, next) => {
    try {
        const { nome, email, telefone, cpf_cnpj, endereco, cidade, estado, observacoes } = req.body;

        if (!nome) {
            return res.status(400).json({ success: false, error: { message: 'Nome e obrigatorio.' } });
        }

        const result = run(
            'INSERT INTO clientes (nome, email, telefone, cpf_cnpj, endereco, cidade, estado, observacoes, user_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
            nome, email, telefone, cpf_cnpj, endereco, cidade, estado, observacoes, req.userId
        );

        const cliente = queryOne('SELECT * FROM clientes WHERE id = ?', result.lastInsertRowid);

        res.status(201).json({ success: true, data: cliente });
    } catch (err) {
        next(err);
    }
};

exports.atualizar = (req, res, next) => {
    try {
        const { id } = req.params;
        const { nome, email, telefone, cpf_cnpj, endereco, cidade, estado, observacoes } = req.body;

        const existing = queryOne('SELECT id FROM clientes WHERE id = ? AND user_id = ?', id, req.userId);
        if (!existing) {
            return res.status(404).json({ success: false, error: { message: 'Cliente nao encontrado.' } });
        }

        run(
            "UPDATE clientes SET nome = ?, email = ?, telefone = ?, cpf_cnpj = ?, endereco = ?, cidade = ?, estado = ?, observacoes = ?, atualizado_em = datetime('now', 'localtime') WHERE id = ? AND user_id = ?",
            nome, email, telefone, cpf_cnpj, endereco, cidade, estado, observacoes, id, req.userId
        );

        const cliente = queryOne('SELECT * FROM clientes WHERE id = ?', id);

        res.json({ success: true, data: cliente });
    } catch (err) {
        next(err);
    }
};

exports.desativar = (req, res, next) => {
    try {
        const { id } = req.params;
        const existing = queryOne('SELECT id FROM clientes WHERE id = ? AND user_id = ?', id, req.userId);
        if (!existing) {
            return res.status(404).json({ success: false, error: { message: 'Cliente nao encontrado.' } });
        }
        run("UPDATE clientes SET ativo = 0, atualizado_em = datetime('now', 'localtime') WHERE id = ? AND user_id = ?", id, req.userId);
        res.json({ success: true, message: 'Cliente desativado.' });
    } catch (err) {
        next(err);
    }
};

exports.listarInteracoes = (req, res, next) => {
    try {
        const { id } = req.params;
        const interacoes = query('SELECT * FROM interacoes WHERE cliente_id = ? AND user_id = ? ORDER BY data_interacao DESC', id, req.userId);
        res.json({ success: true, data: interacoes });
    } catch (err) {
        next(err);
    }
};

exports.criarInteracao = (req, res, next) => {
    try {
        const { id } = req.params;
        const { tipo, descricao, data_interacao } = req.body;

        if (!tipo || !descricao) {
            return res.status(400).json({ success: false, error: { message: 'Tipo e descricao sao obrigatorios.' } });
        }

        const cliente = queryOne('SELECT id FROM clientes WHERE id = ? AND user_id = ?', id, req.userId);
        if (!cliente) {
            return res.status(404).json({ success: false, error: { message: 'Cliente nao encontrado.' } });
        }

        const result = run(
            'INSERT INTO interacoes (cliente_id, tipo, descricao, data_interacao, user_id) VALUES (?, ?, ?, ?, ?)',
            id, tipo, descricao, data_interacao || new Date().toISOString(), req.userId
        );

        const interacao = queryOne('SELECT * FROM interacoes WHERE id = ?', result.lastInsertRowid);

        res.status(201).json({ success: true, data: interacao });
    } catch (err) {
        next(err);
    }
};

exports.listarTransacoes = (req, res, next) => {
    try {
        const { id } = req.params;
        const cliente = queryOne('SELECT id FROM clientes WHERE id = ? AND user_id = ?', id, req.userId);
        if (!cliente) {
            return res.status(404).json({ success: false, error: { message: 'Cliente nao encontrado.' } });
        }

        const transacoes = query(`
            SELECT t.*, c.nome as categoria_nome
            FROM transacoes t
            LEFT JOIN categorias c ON t.categoria_id = c.id
            WHERE t.cliente_id = ? AND t.user_id = ?
            ORDER BY t.data_transacao DESC
        `, id, req.userId);

        res.json({ success: true, data: transacoes });
    } catch (err) {
        next(err);
    }
};
