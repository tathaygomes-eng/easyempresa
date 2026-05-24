import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { PLANOS } from '../../config/planos';
import './PlanGate.css';

export default function PlanGate({ feature, children }) {
    const navigate = useNavigate();
    const { planoKey } = useAuth();
    const planoConfig = PLANOS[planoKey] || PLANOS.gratuito;
    const allowed = planoConfig.features[feature] === true;

    if (allowed) return children;

    const planoNecessario = Object.entries(PLANOS).find(([_, p]) => p.features[feature])?.[1];

    return (
        <div className="plan-gate">
            <div className="plan-gate-content">
                <div className="plan-gate-icon">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <rect x="3" y="11" width="18" height="11" rx="2" />
                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                </div>
                <h3>Recurso exclusivo {planoNecessario?.nome || 'Premium'}</h3>
                <p>Este recurso esta disponivel no plano <strong>{planoNecessario?.nome || 'Premium'}</strong>.</p>
                <p className="plan-gate-current">Seu plano atual: <strong style={{ color: planoConfig?.cor }}>{planoConfig?.nome}</strong></p>
                <button className="plan-gate-btn" onClick={() => navigate('/planos')}>
                    Ver planos e fazer upgrade
                </button>
            </div>
        </div>
    );
}
