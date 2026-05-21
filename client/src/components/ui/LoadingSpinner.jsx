import './LoadingSpinner.css';

export default function LoadingSpinner({ fullScreen = false, message = 'Carregando...' }) {
    if (fullScreen) {
        return (
            <div className="loading-screen">
                <div className="loading-content">
                    <div className="loading-logo">
                        <img src="/logo.png" alt="EasyEmpresa" className="loading-logo-img" />
                        <span className="loading-logo-text">EasyEmpresa</span>
                    </div>
                    <div className="loading-spinner-ring">
                        <div></div><div></div><div></div><div></div>
                    </div>
                    <p className="loading-message">{message}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="loading-inline">
            <div className="loading-spinner-small">
                <div></div><div></div><div></div><div></div>
            </div>
            {message && <span className="loading-inline-text">{message}</span>}
        </div>
    );
}
