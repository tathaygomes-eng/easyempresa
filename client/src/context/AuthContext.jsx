import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabase';
import { PLANOS } from '../config/planos';
import { applyThemeColor } from '../utils/theme';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [usuario, setUsuario] = useState(null);
    const [plano, setPlano] = useState(null);
    const [loading, setLoading] = useState(true);

    const loadProfile = useCallback(async (userId) => {
        const { data, error } = await supabase
            .from('usuarios')
            .select('*')
            .eq('id', userId)
            .single();

        if (error || !data) return null;

        // Verificar se plano expirou
        if (data.plano !== 'gratuito' && data.plano_expira_em) {
            const expiraEm = new Date(data.plano_expira_em);
            if (expiraEm < new Date()) {
                // Plano expirou - voltar para gratuito
                await supabase
                    .from('usuarios')
                    .update({ plano: 'gratuito', plano_expira_em: null, atualizado_em: new Date().toISOString() })
                    .eq('id', userId);
                data.plano = 'gratuito';
                data.plano_expira_em = null;
            }
        }

        return data;
    }, []);

    const applyUserTheme = useCallback(async (userId) => {
        try {
            const { data } = await supabase
                .from('empresa_config')
                .select('cor_principal')
                .eq('user_id', userId)
                .single();
            if (data?.cor_principal) {
                applyThemeColor(data.cor_principal);
            }
        } catch (e) {
            console.warn('Erro ao carregar tema:', e);
        }
    }, []);

    const refreshProfile = useCallback(async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            setUsuario(null);
            setPlano(null);
            return;
        }
        const profile = await loadProfile(user.id);
        if (profile) {
            setUsuario(profile);
            setPlano(PLANOS[profile.plano] || PLANOS.gratuito);
            applyUserTheme(user.id);
        }
    }, [loadProfile, applyUserTheme]);

    useEffect(() => {
        // Verificar sessão inicial
        const timeoutId = setTimeout(() => {
            console.warn('Timeout ao carregar sessao');
            setLoading(false);
        }, 10000);

        supabase.auth.getSession().then(async ({ data: { session } }) => {
            try {
                if (session?.user) {
                    const profile = await loadProfile(session.user.id);
                    if (profile) {
                        setUsuario(profile);
                        setPlano(PLANOS[profile.plano] || PLANOS.gratuito);
                        applyUserTheme(session.user.id).catch(() => {});
                    }
                }
            } catch (e) {
                console.error('Erro ao carregar sessao:', e);
            } finally {
                clearTimeout(timeoutId);
                setLoading(false);
            }
        }).catch((e) => {
            console.error('Erro ao obter sessao:', e);
            clearTimeout(timeoutId);
            setLoading(false);
        });

        // Listener de mudanças de autenticação
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (event === 'SIGNED_IN' && session?.user) {
                const profile = await loadProfile(session.user.id);
                if (profile) {
                    setUsuario(profile);
                    setPlano(PLANOS[profile.plano] || PLANOS.gratuito);
                    applyUserTheme(session.user.id).catch(() => {});
                }
            } else if (event === 'SIGNED_OUT') {
                setUsuario(null);
                setPlano(null);
            }
        });

        return () => subscription.unsubscribe();
    }, [loadProfile]);

    const signIn = async (email, password) => {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw new Error(error.message);

        const profile = await loadProfile(data.user.id);
        if (!profile) throw new Error('Perfil nao encontrado.');

        setUsuario(profile);
        setPlano(PLANOS[profile.plano] || PLANOS.gratuito);
        applyUserTheme(data.user.id).catch(() => {});
        return profile;
    };

    const signUp = async (nome, email, password) => {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: { data: { nome } }
        });
        if (error) throw new Error(error.message);

        // Aguardar o trigger criar o perfil
        await new Promise(r => setTimeout(r, 500));

        // Fallback: se o trigger nao existir, criar o perfil manualmente
        const { data: existingProfile } = await supabase
            .from('usuarios')
            .select('id')
            .eq('id', data.user.id)
            .single();

        if (!existingProfile) {
            await supabase.from('usuarios').insert({
                id: data.user.id,
                nome: nome,
                email: email,
                plano: 'gratuito'
            });
        }

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

        // Seed categorias do sistema
        await seedCategorias(data.user.id);

        const profile = await loadProfile(data.user.id);
        if (profile) {
            setUsuario(profile);
            setPlano(PLANOS[profile.plano] || PLANOS.gratuito);
            applyUserTheme(data.user.id).catch(() => {});
        }
        return profile;
    };

    const signOut = async () => {
        await supabase.auth.signOut();
        setUsuario(null);
        setPlano(null);
    };

    const isPlanoAtivo = () => {
        if (!usuario) return false;
        if (usuario.plano === 'gratuito') return true;
        if (!usuario.plano_expira_em) return true;
        return new Date(usuario.plano_expira_em) > new Date();
    };

    const value = {
        usuario,
        plano,
        loading,
        signIn,
        signUp,
        signOut,
        refreshProfile,
        isPlanoAtivo,
        applyUserTheme,
        planoKey: usuario?.plano || 'gratuito'
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth deve ser usado dentro de AuthProvider');
    return context;
}

// Seed categorias do sistema para novos usuarios
async function seedCategorias(userId) {
    const SYSTEM_CATEGORIES = [
        { nome: 'Vendas', tipo: 'receita', cor: '#10B981', icone: 'shopping-cart' },
        { nome: 'Servicos', tipo: 'receita', cor: '#3B82F6', icone: 'briefcase' },
        { nome: 'Consultoria', tipo: 'receita', cor: '#8B5CF6', icone: 'message-circle' },
        { nome: 'Comissoes', tipo: 'receita', cor: '#F59E0B', icone: 'percent' },
        { nome: 'Outros Recebimentos', tipo: 'receita', cor: '#6366F1', icone: 'plus-circle' },
        { nome: 'Aluguel', tipo: 'despesa', cor: '#EF4444', icone: 'home' },
        { nome: 'Salarios', tipo: 'despesa', cor: '#F97316', icone: 'users' },
        { nome: 'Impostos', tipo: 'despesa', cor: '#DC2626', icone: 'file-text' },
        { nome: 'Energia', tipo: 'despesa', cor: '#FBBF24', icone: 'zap' },
        { nome: 'Agua', tipo: 'despesa', cor: '#06B6D4', icone: 'droplet' },
        { nome: 'Internet', tipo: 'despesa', cor: '#8B5CF6', icone: 'wifi' },
        { nome: 'Marketing', tipo: 'despesa', cor: '#EC4899', icone: 'megaphone' },
        { nome: 'Transporte', tipo: 'despesa', cor: '#14B8A6', icone: 'truck' },
        { nome: 'Outros Gastos', tipo: 'despesa', cor: '#6B7280', icone: 'more-horizontal' },
    ];

    const rows = SYSTEM_CATEGORIES.map(cat => ({
        ...cat,
        user_id: null,
        ativo: 1
    }));

    await supabase.from('categorias').insert(rows);
}
