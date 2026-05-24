-- =============================================
-- EasyEmpresa - Schema Supabase
-- =============================================

-- Tabela: usuarios (perfis)
CREATE TABLE IF NOT EXISTS public.usuarios (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    nome TEXT NOT NULL,
    email TEXT NOT NULL,
    plano TEXT NOT NULL DEFAULT 'gratuito',
    plano_expira_em TIMESTAMPTZ,
    kirvano_order_id TEXT,
    ativo INTEGER DEFAULT 1,
    criado_em TIMESTAMPTZ DEFAULT now(),
    atualizado_em TIMESTAMPTZ DEFAULT now()
);

-- Tabela: empresa_config
CREATE TABLE IF NOT EXISTS public.empresa_config (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES public.usuarios(id) ON DELETE CASCADE,
    nome_empresa TEXT,
    ramo_atividade TEXT,
    objetivo TEXT DEFAULT '[]',
    onboarding_completo INTEGER DEFAULT 0,
    criado_em TIMESTAMPTZ DEFAULT now(),
    atualizado_em TIMESTAMPTZ DEFAULT now()
);

-- Tabela: categorias
CREATE TABLE IF NOT EXISTS public.categorias (
    id BIGSERIAL PRIMARY KEY,
    nome TEXT NOT NULL,
    tipo TEXT NOT NULL,
    cor TEXT DEFAULT '#6B7280',
    icone TEXT DEFAULT 'tag',
    ativo INTEGER DEFAULT 1,
    user_id UUID REFERENCES public.usuarios(id) ON DELETE CASCADE,
    criado_em TIMESTAMPTZ DEFAULT now(),
    atualizado_em TIMESTAMPTZ DEFAULT now()
);

-- Tabela: clientes
CREATE TABLE IF NOT EXISTS public.clientes (
    id BIGSERIAL PRIMARY KEY,
    nome TEXT NOT NULL,
    email TEXT,
    telefone TEXT,
    cpf_cnpj TEXT,
    endereco TEXT,
    observacoes TEXT,
    ativo INTEGER DEFAULT 1,
    user_id UUID REFERENCES public.usuarios(id) ON DELETE CASCADE,
    criado_em TIMESTAMPTZ DEFAULT now(),
    atualizado_em TIMESTAMPTZ DEFAULT now()
);

-- Tabela: transacoes
CREATE TABLE IF NOT EXISTS public.transacoes (
    id BIGSERIAL PRIMARY KEY,
    tipo TEXT NOT NULL,
    descricao TEXT NOT NULL,
    valor NUMERIC NOT NULL,
    data_transacao DATE NOT NULL,
    data_vencimento DATE,
    status TEXT DEFAULT 'pendente',
    categoria_id BIGINT REFERENCES public.categorias(id),
    cliente_id BIGINT REFERENCES public.clientes(id),
    forma_pagamento TEXT,
    observacoes TEXT,
    recorrente INTEGER DEFAULT 0,
    recorrencia_tipo TEXT,
    user_id UUID REFERENCES public.usuarios(id) ON DELETE CASCADE,
    criado_em TIMESTAMPTZ DEFAULT now(),
    atualizado_em TIMESTAMPTZ DEFAULT now()
);

-- Tabela: agendamentos
CREATE TABLE IF NOT EXISTS public.agendamentos (
    id BIGSERIAL PRIMARY KEY,
    titulo TEXT NOT NULL,
    descricao TEXT,
    data_inicio TIMESTAMPTZ NOT NULL,
    data_fim TIMESTAMPTZ,
    status TEXT DEFAULT 'agendado',
    cliente_id BIGINT REFERENCES public.clientes(id),
    user_id UUID REFERENCES public.usuarios(id) ON DELETE CASCADE,
    criado_em TIMESTAMPTZ DEFAULT now(),
    atualizado_em TIMESTAMPTZ DEFAULT now()
);

-- Tabela: interacoes (interacoes com clientes)
CREATE TABLE IF NOT EXISTS public.interacoes (
    id BIGSERIAL PRIMARY KEY,
    cliente_id BIGINT REFERENCES public.clientes(id) ON DELETE CASCADE,
    tipo TEXT NOT NULL,
    descricao TEXT,
    data_interacao TIMESTAMPTZ DEFAULT now(),
    user_id UUID REFERENCES public.usuarios(id) ON DELETE CASCADE,
    criado_em TIMESTAMPTZ DEFAULT now()
);

-- Tabela: assinaturas (log de pagamentos)
CREATE TABLE IF NOT EXISTS public.assinaturas (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES public.usuarios(id) ON DELETE CASCADE,
    plano TEXT NOT NULL,
    valor NUMERIC NOT NULL,
    status TEXT DEFAULT 'ativa',
    kirvano_order_id TEXT,
    kirvano_checkout_id TEXT,
    data_inicio TIMESTAMPTZ DEFAULT now(),
    data_expiracao TIMESTAMPTZ NOT NULL,
    criado_em TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- RLS (Row Level Security)
-- =============================================

ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.empresa_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categorias ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agendamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assinaturas ENABLE ROW LEVEL SECURITY;

-- Policies: usuarios
CREATE POLICY "usuarios_select_own" ON public.usuarios
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "usuarios_insert_own" ON public.usuarios
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "usuarios_update_own" ON public.usuarios
    FOR UPDATE USING (auth.uid() = id);

-- Policies: empresa_config
CREATE POLICY "empresa_config_select_own" ON public.empresa_config
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "empresa_config_insert_own" ON public.empresa_config
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "empresa_config_update_own" ON public.empresa_config
    FOR UPDATE USING (auth.uid() = user_id);

-- Policies: categorias (user pode ver categorias do sistema user_id IS NULL + suas)
CREATE POLICY "categorias_select" ON public.categorias
    FOR SELECT USING (user_id IS NULL OR auth.uid() = user_id);

CREATE POLICY "categorias_insert_own" ON public.categorias
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "categorias_update_own" ON public.categorias
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "categorias_delete_own" ON public.categorias
    FOR DELETE USING (auth.uid() = user_id);

-- Policies: clientes
CREATE POLICY "clientes_select_own" ON public.clientes
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "clientes_insert_own" ON public.clientes
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "clientes_update_own" ON public.clientes
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "clientes_delete_own" ON public.clientes
    FOR DELETE USING (auth.uid() = user_id);

-- Policies: transacoes
CREATE POLICY "transacoes_select_own" ON public.transacoes
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "transacoes_insert_own" ON public.transacoes
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "transacoes_update_own" ON public.transacoes
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "transacoes_delete_own" ON public.transacoes
    FOR DELETE USING (auth.uid() = user_id);

-- Policies: agendamentos
CREATE POLICY "agendamentos_select_own" ON public.agendamentos
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "agendamentos_insert_own" ON public.agendamentos
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "agendamentos_update_own" ON public.agendamentos
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "agendamentos_delete_own" ON public.agendamentos
    FOR DELETE USING (auth.uid() = user_id);

-- Policies: interacoes
CREATE POLICY "interacoes_select_own" ON public.interacoes
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "interacoes_insert_own" ON public.interacoes
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "interacoes_update_own" ON public.interacoes
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "interacoes_delete_own" ON public.interacoes
    FOR DELETE USING (auth.uid() = user_id);

-- Policies: assinaturas
CREATE POLICY "assinaturas_select_own" ON public.assinaturas
    FOR SELECT USING (auth.uid() = user_id);

-- =============================================
-- Trigger: auto-create usuario profile on signup
-- =============================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.usuarios (id, nome, email, plano)
    VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'nome', ''), NEW.email, 'gratuito')
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =============================================
-- Indexes
-- =============================================

CREATE UNIQUE INDEX IF NOT EXISTS idx_empresa_config_user_id ON public.empresa_config(user_id);
CREATE INDEX IF NOT EXISTS idx_categorias_user_id ON public.categorias(user_id);
CREATE INDEX IF NOT EXISTS idx_clientes_user_id ON public.clientes(user_id);
CREATE INDEX IF NOT EXISTS idx_transacoes_user_id ON public.transacoes(user_id);
CREATE INDEX IF NOT EXISTS idx_transacoes_data ON public.transacoes(data_transacao);
CREATE INDEX IF NOT EXISTS idx_agendamentos_user_id ON public.agendamentos(user_id);
CREATE INDEX IF NOT EXISTS idx_agendamentos_data ON public.agendamentos(data_inicio);
CREATE INDEX IF NOT EXISTS idx_interacoes_cliente_id ON public.interacoes(cliente_id);
CREATE INDEX IF NOT EXISTS idx_interacoes_user_id ON public.interacoes(user_id);
CREATE INDEX IF NOT EXISTS idx_assinaturas_user_id ON public.assinaturas(user_id);
