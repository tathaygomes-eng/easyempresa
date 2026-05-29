import { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import BottomNav from './BottomNav';
import './Layout.css';

export default function Layout({ children, usuario, onLogout }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="app-layout">
            <div className={`sidebar-overlay ${sidebarOpen ? 'visible' : ''}`} onClick={() => setSidebarOpen(false)} />
            <Sidebar usuario={usuario} onLogout={onLogout} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
            <div className="app-main">
                <Header onMenuClick={() => setSidebarOpen(true)} />
                <main className="app-content">
                    {children}
                </main>
                <BottomNav />
            </div>
        </div>
    );
}
