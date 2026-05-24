import { supabase } from '../supabase';

export async function login(email, senha) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password: senha });
    if (error) throw new Error('Email ou senha incorretos.');

    const { data: profile } = await supabase
        .from('usuarios')
        .select('*')
        .eq('id', data.user.id)
        .single();

    if (!profile) throw new Error('Perfil nao encontrado.');
    return { success: true, data: { usuario: profile, token: data.session.access_token } };
}

export async function registrar(nome, email, senha) {
    if (!nome || !email || !senha) throw new Error('Nome, email e senha sao obrigatorios.');
    if (senha.length < 6) throw new Error('A senha deve ter pelo menos 6 caracteres.');

    const { data, error } = await supabase.auth.signUp({
        email,
        password: senha,
        options: { data: { nome } }
    });
    if (error) throw new Error(error.message);

    // Trigger handle_new_user() cria o perfil automaticamente
    await new Promise(r => setTimeout(r, 500));

    // Criar config da empresa (upsert para evitar conflito)
    await supabase
        .from('empresa_config')
        .upsert({
            user_id: data.user.id,
            nome_empresa: '',
            ramo_atividade: '',
            objetivo: '[]',
            onboarding_completo: 0
        }, { onConflict: 'user_id' });

    const { data: profile } = await supabase
        .from('usuarios')
        .select('*')
        .eq('id', data.user.id)
        .single();

    return { success: true, data: { usuario: profile, token: data.session?.access_token } };
}

export async function getPerfil() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Sessao expirada.');

    const { data: profile } = await supabase
        .from('usuarios')
        .select('*')
        .eq('id', user.id)
        .single();

    if (!profile) throw new Error('Usuario nao encontrado.');
    return { success: true, data: profile };
}

export async function atualizarPlano(plano) {
    if (!['basico', 'premium', 'gratuito'].includes(plano)) throw new Error('Plano invalido.');

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Sessao expirada.');

    const { data: profile } = await supabase
        .from('usuarios')
        .update({ plano, atualizado_em: new Date().toISOString() })
        .eq('id', user.id)
        .select()
        .single();

    return { success: true, data: profile };
}

export async function logout() {
    await supabase.auth.signOut();
}
