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
                    // Rodar em paralelo para ser mais rapido
                    const [profile] = await Promise.all([
                        loadProfile(session.user.id),
                        applyUserTheme(session.user.id).catch(() => {})
                    ]);
                    if (profile) {
                        setUsuario(profile);
                        setPlano(PLANOS[profile.plano] || PLANOS.gratuito);
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

        // Listener: so SIGNED_OUT (signIn/signUp ja cuidam do SIGNED_IN)
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
            if (event === 'SIGNED_OUT') {
                setUsuario(null);
                setPlano(null);
            }
        });

        return () => subscription.unsubscribe();
    }, [loadProfile]);

    const signIn = async (email, password) => {
        console.log('[Auth] Iniciando signIn...');
        // Timeout de 10s para toda operacao de login
        const withTimeout = (promise, ms = 10000) => {
            const timeout = new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Tempo esgotado. Verifique sua conexao com a internet.')), ms)
            );
            return Promise.race([promise, timeout]);
        };

        console.log('[Auth] Chamando signInWithPassword...');
        const { data, error } = await withTimeout(
            supabase.auth.signInWithPassword({ email, password })
        );
        console.log('[Auth] signInWithPassword resultado:', error ? 'ERRO: ' + error.message : 'OK, user=' + data?.user?.id);
        if (error) throw new Error(error.message);

        console.log('[Auth] Carregando profile...');
        const [profile] = await withTimeout(Promise.all([
            loadProfile(data.user.id),
            applyUserTheme(data.user.id).catch(() => {})
        ]));
        console.log('[Auth] Profile carregado:', profile ? 'OK' : 'NULL');
        if (!profile) throw new Error('Perfil nao encontrado.');

        setUsuario(profile);
        setPlano(PLANOS[profile.plano] || PLANOS.gratuito);
        console.log('[Auth] Login completo!');
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
