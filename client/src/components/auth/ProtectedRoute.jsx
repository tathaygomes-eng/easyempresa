import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { PLANOS } from '../../config/planos';
import LoadingSpinner from '../ui/LoadingSpinner';

export default function ProtectedRoute({ children, requiredFeature }) {
    const { usuario, loading, planoKey } = useAuth();

    if (loading) {
        return <LoadingSpinner fullScreen message="Verificando acesso..." />;
    }

    if (!usuario) {
        return <Navigate to="/login" replace />;
    }

    // Verificar se plano nao expirou (exceto gratuito)
    if (usuario.plano !== 'gratuito' && usuario.plano_expira_em) {
        const expiraEm = new Date(usuario.plano_expira_em);
        if (expiraEm < new Date()) {
            // Plano expirou - pode acessar mas sera redirecionado para planos
            if (requiredFeature) {
                const planoConfig = PLANOS[planoKey] || PLANOS.gratuito;
                if (!planoConfig.features[requiredFeature]) {
                    return <Navigate to="/planos" replace />;
                }
            }
        }
    }

    // Verificar feature necessaria
    if (requiredFeature) {
        const planoConfig = PLANOS[planoKey] || PLANOS.gratuito;
        if (!planoConfig.features[requiredFeature]) {
            return <Navigate to="/planos" replace />;
        }
    }

    return children;
}
