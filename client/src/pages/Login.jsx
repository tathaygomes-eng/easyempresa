import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';
import './Login.css';

export default function Login() {
    const { signIn, signUp } = useAuth();
    const navigate = useNavigate();
    const [view, setView] = useState('login'); // login | register | forgot | reset
    const [form, setForm] = useState({ nome: '', email: '', senha: '', novaSenha: '' });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    // Detectar se o usuario voltou do link de recuperacao do Supabase
    useEffect(() => {
        supabase.auth.onAuthStateChange((event) => {
            if (event === 'PASSWORD_RECOVERY') {
                setView('reset');
            }
        });
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        try {
            if (view === 'register') {
                await signUp(form.nome, form.email, form.senha);
                navigate('/');
            } else if (view === 'login') {
                await signIn(form.email, form.senha);
                navigate('/');
            } else if (view === 'forgot') {
                const { error } = await supabase.auth.resetPasswordForEmail(form.email, {
                    redirectTo: window.location.origin + '/login'
                });
                if (error) throw error;
                setSuccess('Email enviado! Verifique sua caixa de entrada e clique no link para redefinir sua senha.');
            } else if (view === 'reset') {
                const { error } = await supabase.auth.updateUser({ password: form.novaSenha });
                if (error) throw error;
                setSuccess('Senha alterada com sucesso! Faca login com sua nova senha.');
                setTimeout(() => setView('login'), 2000);
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const resetState = () => {
        setError('');
        setSuccess('');
    };

    return (
        <div className="login-page">
            <div className="login-container">
                <div className="login-header">
                    <div className="login-logo">
                        <img src="/logo.png" alt="EasyEmpresa" className="login-logo-img" />
                        <h1>EasyEmpresa</h1>
                    </div>
                    <p>
                        {view === 'login' && 'Entre na sua conta'}
                        {view === 'register' && 'Crie sua conta'}
                        {view === 'forgot' && 'Recuperar senha'}
                        {view === 'reset' && 'Nova senha'}
                    </p>
                </div>

                {error && <div className="login-error">{error}</div>}
                {success && <div className="login-success">{success}</div>}

                <form onSubmit={handleSubmit}>
                    {view === 'register' && (
                        <div className="form-field">
                            <label>Nome</label>
                            <input
                                type="text"
                                placeholder="Seu nome"
                                value={form.nome}
                                onChange={e => setForm({ ...form, nome: e.target.value })}
                                required
                            />
                        </div>
                    )}

                    {(view === 'login' || view === 'register') && (
                        <>
                            <div className="form-field">
                                <label>Email</label>
                                <input
                                    type="email"
                                    placeholder="seu@email.com"
                                    value={form.email}
                                    onChange={e => setForm({ ...form, email: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-field">
                                <label>Senha</label>
                                <input
                                    type="password"
                                    placeholder="Minimo 6 caracteres"
                                    value={form.senha}
                                    onChange={e => setForm({ ...form, senha: e.target.value })}
                                    required
                                    minLength={6}
                                />
                            </div>
                            {view === 'login' && (
                                <div className="forgot-password-link">
                                    <button type="button" onClick={() => { setView('forgot'); resetState(); }}>
                                        Esqueci minha senha
                                    </button>
                                </div>
                            )}
                        </>
                    )}

                    {view === 'forgot' && (
                        <div className="form-field">
                            <label>Email cadastrado</label>
                            <input
                                type="email"
                                placeholder="seu@email.com"
                                value={form.email}
                                onChange={e => setForm({ ...form, email: e.target.value })}
                                required
                            />
                            <p className="form-hint">Enviaremos um link para redefinir sua senha.</p>
                        </div>
                    )}

                    {view === 'reset' && (
                        <div className="form-field">
                            <label>Nova senha</label>
                            <input
                                type="password"
                                placeholder="Minimo 6 caracteres"
                                value={form.novaSenha}
                                onChange={e => setForm({ ...form, novaSenha: e.target.value })}
                                required
                                minLength={6}
                            />
                        </div>
                    )}

                    <button type="submit" className="login-btn" disabled={loading}>
                        {loading ? 'Carregando...' : (
                            <>
                                {view === 'login' && 'Entrar'}
                                {view === 'register' && 'Criar Conta'}
                                {view === 'forgot' && 'Enviar link de recuperacao'}
                                {view === 'reset' && 'Redefinir senha'}
                            </>
                        )}
                    </button>
                </form>

                <div className="login-footer">
                    {view === 'login' && (
                        <button onClick={() => { setView('register'); resetState(); }}>
                            Nao tem conta? Cadastre-se
                        </button>
                    )}
                    {view === 'register' && (
                        <button onClick={() => { setView('login'); resetState(); }}>
                            Ja tem conta? Entre aqui
                        </button>
                    )}
                    {(view === 'forgot' || view === 'reset') && (
                        <button onClick={() => { setView('login'); resetState(); }}>
                            Voltar ao login
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
