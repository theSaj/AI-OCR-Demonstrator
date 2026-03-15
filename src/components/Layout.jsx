import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';

const Layout = ({ children }) => {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen);
    };

    const closeSidebar = () => {
        setSidebarOpen(false);
    };

    return (
        <div className="app-container">
            {/* Sidebar */}
            <nav className={`site-sidebar ${sidebarOpen ? 'open' : ''}`} aria-label="Main Navigation">
                <div style={{ paddingBottom: '1rem', borderBottom: '1px solid #dfe1e2', marginBottom: '1rem' }}>
                    <div style={{ fontSize: '0.875rem', fontWeight: '600', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Menu
                    </div>
                </div>
                <ul className="nav-links">
                    <li className="nav-item">
                        <NavLink
                            to="/"
                            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                            onClick={closeSidebar}
                        >
                            <span aria-hidden="true">🏠</span> Home
                        </NavLink>
                    </li>
                    <li className="nav-item">
                        <NavLink
                            to="/about"
                            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                            onClick={closeSidebar}
                        >
                            <span aria-hidden="true">ℹ️</span> About Us
                        </NavLink>
                    </li>
                    <li className="nav-item">
                        <NavLink
                            to="/processor"
                            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                            onClick={closeSidebar}
                        >
                            <span aria-hidden="true">⚡</span> Processor
                        </NavLink>
                    </li>
                    <li className="nav-item">
                        <NavLink
                            to="/files"
                            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                            onClick={closeSidebar}
                        >
                            <span aria-hidden="true">📁</span> Files
                        </NavLink>
                    </li>
                    <li className="nav-item">
                        <NavLink
                            to="/library"
                            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                            onClick={closeSidebar}
                        >
                            <span aria-hidden="true">📚</span> Data Library
                        </NavLink>
                    </li>
                    <li className="nav-item">
                        <NavLink
                            to="/author"
                            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                            onClick={closeSidebar}
                        >
                            <span aria-hidden="true">👤</span> Author
                        </NavLink>
                    </li>
                    <li className="nav-item">
                        <NavLink
                            to="/settings"
                            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                            onClick={closeSidebar}
                        >
                            <span aria-hidden="true">⚙️</span> Settings
                        </NavLink>
                    </li>
                </ul>
            </nav>

            {/* Header */}
            <header className="site-header">
                <button className="menu-toggle" onClick={toggleSidebar} aria-label="Toggle Sidebar" aria-expanded={sidebarOpen}>
                    <span aria-hidden="true">☰</span>
                </button>
                <div className="header-title">
                    <span>AI OCR Demonstrator</span>
                </div>
                <div className="header-actions">
                    {/* Add header actions if needed */}
                </div>
            </header>

            {/* Main Content */}
            <main className="site-main">
                {children}
            </main>

            {/* Footer */}
            <footer className="site-footer">
                <p>&copy; 2026 AI OCR Demonstrator.</p>
            </footer>

            {/* Mobile Overlay */}
            <div
                className={`overlay ${sidebarOpen ? 'active' : ''}`}
                onClick={closeSidebar}
            ></div>
        </div>
    );
};

export default Layout;
