import { useState } from 'react';
import { atualizarPlano } from '../services/authService';
import './Planos.css';

export default function Planos({ usuario }) {
    const [loading, setLoading] = useState(false);
    const [mensagem, setMensagem] = useState('');

    const handleAssinar = async (plano) => {
        setLoading(true);
        setMensagem('');
        try {
            const res = await atualizarPlano(plano);
            const usuarioAtualizado = { ...usuario, plano: res.data.plano };
            localStorage.setItem('usuario', JSON.stringify(usuarioAtualizado));
            setMensagem(`Plano ${plano === 'premium' ? 'Premium' : 'Basico'} ativado com sucesso!`);
            setTimeout(() => window.location.reload(), 1500);
        } catch (err) {
            setMensagem('Erro ao atualizar plano: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="planos-page">
            <div className="planos-header">
                <h1>Escolha seu Plano</h1>
                <p>Selecione o plano ideal para o seu negocio</p>
            </div>

            {mensagem && (
                <div className={`planos-mensagem ${mensagem.includes('Erro') ? 'erro' : 'sucesso'}`}>
                    {mensagem}
                </div>
            )}

            <div className="planos-grid">
                {/* Plano Gratuito */}
                <div className={`plano-card gratuito ${usuario?.plano === 'gratuito' ? 'atual' : ''}`}>
                    <div className="plano-topo">
                        <h2>Gratuito</h2>
                        <div className="plano-preco">
                            <span className="valor-gratuito">Gratis</span>
                        </div>
                        <p className="plano-descricao">Para quem esta comecando</p>
                    </div>
                    <ul className="plano-beneficios">
                        <li className="incluido">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                            Ate 10 transacoes por mes
                        </li>
                        <li className="incluido">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                            Ate 5 clientes cadastrados
                        </li>
                        <li className="incluido">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                            Calendario basico
                        </li>
                        <li className="nao-incluido">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                            Dashboard com graficos
                        </li>
                        <li className="nao-incluido">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                            Relatorios avancados
                        </li>
                        <li className="nao-incluido">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                            Fluxo de caixa
                        </li>
                        <li className="nao-incluido">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                            Suporte prioritario
                        </li>
                    </ul>
                    <div className="plano-btn-area">
                        {usuario?.plano === 'gratuito' && (
                            <span className="plano-atual-badge">Seu plano atual</span>
                        )}
                    </div>
                </div>

                {/* Plano Basico */}
                <div className={`plano-card basico ${usuario?.plano === 'basico' ? 'atual' : ''}`}>
                    <div className="plano-topo">
                        <h2>Basico</h2>
                        <div className="plano-preco">
                            <span className="moeda">R$</span>
                            <span className="valor">9</span>
                            <span className="centavos">,90</span>
                            <span className="periodo">/mes</span>
                        </div>
                        <p className="plano-descricao">Para pequenos negocios</p>
                    </div>
                    <ul className="plano-beneficios">
                        <li className="incluido">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                            Ate 100 transacoes por mes
                        </li>
                        <li className="incluido">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                            Ate 50 clientes cadastrados
                        </li>
                        <li className="incluido">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                            Calendario completo
                        </li>
                        <li className="incluido">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                            Dashboard com graficos
                        </li>
                        <li className="incluido">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                            Relatorios basicos
                        </li>
                        <li className="nao-incluido">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                            Fluxo de caixa com projecoes
                        </li>
                        <li className="nao-incluido">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                            Suporte prioritario
                        </li>
                    </ul>
                    <div className="plano-btn-area">
                        {usuario?.plano === 'basico' ? (
                            <span className="plano-atual-badge">Seu plano atual</span>
                        ) : (
                            <button
                                className="plano-btn basico"
                                onClick={() => handleAssinar('basico')}
                                disabled={loading}
                            >
                                Assinar Basico
                            </button>
                        )}
                    </div>
                </div>

                {/* Plano Premium */}
                <div className={`plano-card premium ${usuario?.plano === 'premium' ? 'atual' : ''}`}>
                    <div className="plano-badge">MELHOR CUSTO-BENEFICIO</div>
                    <div className="plano-topo">
                        <h2>Premium</h2>
                        <div className="plano-preco">
                            <span className="moeda">R$</span>
                            <span className="valor">49</span>
                            <span className="centavos">,90</span>
                            <span className="periodo">/mes</span>
                        </div>
                        <p className="plano-descricao">Para empresas que querem crescer</p>
                    </div>
                    <ul className="plano-beneficios">
                        <li className="incluido destaque">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                            Transacoes ilimitadas
                        </li>
                        <li className="incluido destaque">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                            Clientes ilimitados
                        </li>
                        <li className="incluido">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                            Calendario completo com lembretes
                        </li>
                        <li className="incluido">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                            Dashboard completo com graficos
                        </li>
                        <li className="incluido">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                            Relatorios avancados
                        </li>
                        <li className="incluido">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                            Fluxo de caixa com projecoes
                        </li>
                        <li className="incluido">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                            Suporte prioritario 24/7
                        </li>
                        <li className="incluido destaque">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                            Exportar dados em PDF/Excel
                        </li>
                    </ul>
                    <div className="plano-btn-area">
                        {usuario?.plano === 'premium' ? (
                            <span className="plano-atual-badge">Seu plano atual</span>
                        ) : (
                            <button
                                className="plano-btn premium"
                                onClick={() => handleAssinar('premium')}
                                disabled={loading}
                            >
                                Assinar Premium
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
