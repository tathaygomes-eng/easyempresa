import { Link } from 'react-router-dom';
import './NotFound.css';

export default function NotFound() {
    return (
        <div className="not-found">
            <div className="not-found-content">
                <div className="not-found-code">404</div>
                <h2>Pagina nao encontrada</h2>
                <p>A pagina que voce procura nao existe ou foi movida.</p>
                <Link to="/" className="btn-primary not-found-link">
                    Voltar ao Dashboard
                </Link>
            </div>
        </div>
    );
}
