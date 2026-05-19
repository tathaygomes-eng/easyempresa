-- Schema do Sistema de Gestao Empresarial

CREATE TABLE IF NOT EXISTS usuarios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    senha TEXT NOT NULL,
    plano TEXT DEFAULT 'gratuito' CHECK(plano IN ('gratuito', 'basico', 'premium')),
    ativo INTEGER DEFAULT 1,
    criado_em TEXT DEFAULT (datetime('now', 'localtime')),
    atualizado_em TEXT DEFAULT (datetime('now', 'localtime'))
);

CREATE TABLE IF NOT EXISTS categorias (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL UNIQUE,
    tipo TEXT NOT NULL CHECK(tipo IN ('receita', 'despesa')),
    cor TEXT DEFAULT '#6B7280',
    icone TEXT DEFAULT 'tag',
    ativo INTEGER DEFAULT 1,
    criado_em TEXT DEFAULT (datetime('now', 'localtime')),
    atualizado_em TEXT DEFAULT (datetime('now', 'localtime'))
);

CREATE TABLE IF NOT EXISTS clientes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    email TEXT,
    telefone TEXT,
    cpf_cnpj TEXT,
    endereco TEXT,
    cidade TEXT,
    estado TEXT,
    observacoes TEXT,
    ativo INTEGER DEFAULT 1,
    criado_em TEXT DEFAULT (datetime('now', 'localtime')),
    atualizado_em TEXT DEFAULT (datetime('now', 'localtime'))
);

CREATE TABLE IF NOT EXISTS transacoes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tipo TEXT NOT NULL CHECK(tipo IN ('receita', 'despesa')),
    descricao TEXT NOT NULL,
    valor REAL NOT NULL CHECK(valor > 0),
    data_transacao TEXT NOT NULL,
    data_vencimento TEXT,
    status TEXT NOT NULL DEFAULT 'pendente' CHECK(status IN ('pago', 'pendente', 'atrasado')),
    categoria_id INTEGER,
    cliente_id INTEGER,
    forma_pagamento TEXT,
    observacoes TEXT,
    recorrente INTEGER DEFAULT 0,
    recorrencia_tipo TEXT CHECK(recorrencia_tipo IN ('mensal', 'semanal', 'anual', NULL)),
    criado_em TEXT DEFAULT (datetime('now', 'localtime')),
    atualizado_em TEXT DEFAULT (datetime('now', 'localtime')),
    FOREIGN KEY (categoria_id) REFERENCES categorias(id) ON DELETE SET NULL,
    FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS agendamentos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    titulo TEXT NOT NULL,
    descricao TEXT,
    data_inicio TEXT NOT NULL,
    data_fim TEXT NOT NULL,
    dia_inteiro INTEGER DEFAULT 0,
    cliente_id INTEGER,
    local TEXT,
    status TEXT NOT NULL DEFAULT 'agendado' CHECK(status IN ('agendado', 'confirmado', 'concluido', 'cancelado')),
    lembrete INTEGER DEFAULT 1,
    lembrete_minutos INTEGER DEFAULT 30,
    cor TEXT DEFAULT '#3B82F6',
    recorrente INTEGER DEFAULT 0,
    criado_em TEXT DEFAULT (datetime('now', 'localtime')),
    atualizado_em TEXT DEFAULT (datetime('now', 'localtime')),
    FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS interacoes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    cliente_id INTEGER NOT NULL,
    tipo TEXT NOT NULL CHECK(tipo IN ('reuniao', 'ligacao', 'email', 'whatsapp', 'nota', 'outro')),
    descricao TEXT NOT NULL,
    data_interacao TEXT NOT NULL,
    criado_em TEXT DEFAULT (datetime('now', 'localtime')),
    FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS empresa_config (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL UNIQUE,
    nome_empresa TEXT,
    ramo_atividade TEXT,
    objetivo TEXT,
    onboarding_completo INTEGER DEFAULT 0,
    criado_em TEXT DEFAULT (datetime('now', 'localtime')),
    atualizado_em TEXT DEFAULT (datetime('now', 'localtime')),
    FOREIGN KEY (user_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

-- Indices para Performance
CREATE INDEX IF NOT EXISTS idx_transacoes_data ON transacoes(data_transacao);
CREATE INDEX IF NOT EXISTS idx_transacoes_status ON transacoes(status);
CREATE INDEX IF NOT EXISTS idx_transacoes_tipo ON transacoes(tipo);
CREATE INDEX IF NOT EXISTS idx_transacoes_categoria ON transacoes(categoria_id);
CREATE INDEX IF NOT EXISTS idx_transacoes_cliente ON transacoes(cliente_id);
CREATE INDEX IF NOT EXISTS idx_agendamentos_data ON agendamentos(data_inicio);
CREATE INDEX IF NOT EXISTS idx_agendamentos_cliente ON agendamentos(cliente_id);
CREATE INDEX IF NOT EXISTS idx_interacoes_cliente ON interacoes(cliente_id);
