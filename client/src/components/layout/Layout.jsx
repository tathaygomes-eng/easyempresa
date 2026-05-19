import Sidebar from './Sidebar';
import Header from './Header';
import './Layout.css';

export default function Layout({ children, usuario, onLogout }) {
    return (
        <div className="app-layout">
            <Sidebar usuario={usuario} onLogout={onLogout} />
            <div className="app-main">
                <Header usuario={usuario} />
                <main className="app-content">
                    {children}
                </main>
            </div>
        </div>
    );
}
