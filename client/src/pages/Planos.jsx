import { useState } from 'react';
import { atualizarPlano } from '../services/authService';
import { PLANOS, getPlanoAtual } from '../config/planos';
import { useToast } from '../components/ui/Toast';
import './Planos.css';

const CheckIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
);

const XIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
);

export default function Planos() {
    const toast = useToast();
    const [loading, setLoading] = useState(null);
    const planoAtual = getPlanoAtual();

    const handleAssinar = async (planoKey) => {
        if (planoKey === planoAtual) return;

  if (planoKey === "pro") {
    window.open("https://pay.kirvano.com/0b135afa-4b8f-490c-8c1c-c70ecffa8d5e", "_blank");
    return;
  }

  if (planoKey === "business") {
    window.open("https://pay.kirvano.com/c5a42b3d-f997-4438-bf82-7e927b125390", "_blank");
    return;
  }
    };

    const ordem = ['gratuito', 'basico', 'premium'];

    return (
        <div className="planos-page">
            <div className="planos-header">
                <h1>Escolha seu Plano</h1>
                <p>Selecione o plano ideal para o seu negocio</p>
            </div>

            <div className="planos-grid">
                {ordem.map(key => {
                    const plano = PLANOS[key];
                    const isAtual = key === planoAtual;
                    const isDowngrade = ordem.indexOf(key) < ordem.indexOf(planoAtual);

                    return (
                        <div key={key} className={`plano-card ${key} ${isAtual ? 'atual' : ''}`}>
                            {plano.badge && <div className="plano-badge">{plano.badge}</div>}

                            <div className="plano-topo">
                                <h2>{plano.nome}</h2>
                                <div className="plano-preco">
                                    {plano.preco === 0 ? (
                                        <span className="valor-gratuito">Gratis</span>
                                    ) : (
                                        <>
                                            <span className="moeda">R$</span>
                                            <span className="valor">{String(plano.preco).split('.')[0]}</span>
                                            <span className="centavos">,{String(plano.preco).split('.')[1] || '00'}</span>
                                            <span className="periodo">/mes</span>
                                        </>
                                    )}
                                </div>
                                <p className="plano-descricao">{plano.descricao}</p>
                            </div>

                            <ul className="plano-beneficios">
                                {plano.beneficios.map((b, i) => (
                                    <li key={i} className={`${b.incluido ? 'incluido' : 'nao-incluido'} ${b.destaque ? 'destaque' : ''}`}>
                                        {b.incluido ? <CheckIcon /> : <XIcon />}
                                        <span>{b.texto}</span>
                                    </li>
                                ))}
                            </ul>

                            <div className="plano-btn-area">
                                {isAtual ? (
                                    <span className="plano-atual-badge">Seu plano atual</span>
                                ) : (
                                    <button
                                        className={`plano-btn ${key}`}
                                        onClick={() => handleAssinar(key)}
                                        disabled={loading !== null}
                                    >
                                        {loading === key ? 'Ativando...' : isDowngrade ? 'Fazer downgrade' : 'Assinar agora'}
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
