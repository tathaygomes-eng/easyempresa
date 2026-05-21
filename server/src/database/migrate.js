const fs = require('fs');
const path = require('path');
const { exec, queryOne, query, run } = require('./db');

function migrate() {
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf-8');
    exec(schema);

    // Adicionar user_id em tabelas existentes (migration)
    const tabelas = ['clientes', 'transacoes', 'agendamentos', 'interacoes', 'categorias'];
    for (const tabela of tabelas) {
        try {
            const columns = query(`PRAGMA table_info(${tabela})`);
            const hasUserId = columns.some(c => c.name === 'user_id');
            if (!hasUserId) {
                run(`ALTER TABLE ${tabela} ADD COLUMN user_id INTEGER REFERENCES usuarios(id)`);
                console.log(`Coluna user_id adicionada em ${tabela}.`);
            }
        } catch (e) {
            // Tabela pode nao existir ainda, ignorar
        }
    }

    // Criar indice em user_id
    try {
        exec('CREATE INDEX IF NOT EXISTS idx_clientes_user ON clientes(user_id)');
        exec('CREATE INDEX IF NOT EXISTS idx_transacoes_user ON transacoes(user_id)');
        exec('CREATE INDEX IF NOT EXISTS idx_agendamentos_user ON agendamentos(user_id)');
        exec('CREATE INDEX IF NOT EXISTS idx_interacoes_user ON interacoes(user_id)');
        exec('CREATE INDEX IF NOT EXISTS idx_categorias_user ON categorias(user_id)');
    } catch (e) {
        // Ignorar se indice ja existe
    }

    console.log('Schema criado com sucesso.');
}

function seed() {
    const result = queryOne('SELECT COUNT(*) as count FROM categorias');
    if (result && result.count > 0) {
        console.log('Categorias ja existem, seed ignorado.');
        return;
    }

    const categoriasReceita = [
        ['Venda de Produto', '#10B981', 'package'],
        ['Prestacao de Servico', '#3B82F6', 'briefcase'],
        ['Consultoria', '#8B5CF6', 'users'],
        ['Recorrencia', '#F59E0B', 'repeat'],
        ['Outros', '#6B7280', 'tag'],
    ];

    const categoriasDespesa = [
        ['Aluguel', '#EF4444', 'home'],
        ['Salarios', '#F97316', 'users'],
        ['Fornecedores', '#EC4899', 'truck'],
        ['Marketing', '#8B5CF6', 'megaphone'],
        ['Impostos', '#DC2626', 'file-text'],
        ['Transporte', '#F59E0B', 'car'],
        ['Internet/Telefone', '#06B6D4', 'wifi'],
        ['Material de Escritorio', '#84CC16', 'paperclip'],
        ['Outros', '#6B7280', 'tag'],
    ];

    for (const [nome, cor, icone] of categoriasReceita) {
        run('INSERT OR IGNORE INTO categorias (nome, tipo, cor, icone) VALUES (?, ?, ?, ?)', nome, 'receita', cor, icone);
    }
    for (const [nome, cor, icone] of categoriasDespesa) {
        run('INSERT OR IGNORE INTO categorias (nome, tipo, cor, icone) VALUES (?, ?, ?, ?)', nome, 'despesa', cor, icone);
    }

    console.log('Categorias padrao criadas com sucesso.');
}

module.exports = { migrate, seed };
