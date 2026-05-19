import { useState } from 'react';
import { login, registrar } from '../services/authService';
import './Login.css';

export default function Login({ onLogin }) {
    const [isRegister, setIsRegister] = useState(false);
    const [form, setForm] = useState({ nome: '', email: '', senha: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            let res;
            if (isRegister) {
                res = await registrar(form.nome, form.email, form.senha);
            } else {
                res = await login(form.email, form.senha);
            }

            localStorage.setItem('token', res.data.token);
            localStorage.setItem('usuario', JSON.stringify(res.data.usuario));
            onLogin(res.data.usuario);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">
            <div className="login-container">
                <div className="login-header">
                    <div className="login-logo">
                        <img src="/logo.png" alt="EasyEmpresa" className="login-logo-img" />
                        <h1>EasyEmpresa</h1>
                    </div>
                    <p>{isRegister ? 'Crie sua conta' : 'Entre na sua conta'}</p>
                </div>

                {error && <div className="login-error">{error}</div>}

                <form onSubmit={handleSubmit}>
                    {isRegister && (
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
                    <button type="submit" className="login-btn" disabled={loading}>
                        {loading ? 'Carregando...' : (isRegister ? 'Criar Conta' : 'Entrar')}
                    </button>
                </form>

                <div className="login-footer">
                    <button onClick={() => { setIsRegister(!isRegister); setError(''); }}>
                        {isRegister ? 'Ja tem conta? Entre aqui' : 'Nao tem conta? Cadastre-se'}
                    </button>
                </div>
            </div>
        </div>
    );
}
