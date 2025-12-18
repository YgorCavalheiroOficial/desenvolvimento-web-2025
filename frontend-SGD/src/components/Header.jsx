// frontend-vite/src/components/Header.jsx
import React from 'react';
import { useAuth } from '../context/AuthContext'; // <-- Importe
import './Header.css';

const Header = ({ title }) => {
    const { user, logout } = useAuth();

    return (
        <header className="header" style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
            padding: '20px 0', borderBottom: '1px solid #333'
        }}>
            <h1>{title}</h1>
            <div style={{display: 'flex', alignItems: 'center', gap: '20px'}}>
                <span style={{fontSize: '0.9rem'}}>
                    Olá, <strong>{user?.nome}</strong> ({user?.role})
                </span>
                <button 
                    onClick={logout} 
                    style={{backgroundColor: '#b71c1c', color: 'white', padding: '10px', border: 'none', borderRadius: '4px', cursor: 'pointer'}}
                >
                    Logout
                </button>
                {/* O botão "+ Nova Despesa/Categoria" será adicionado dentro do CRUD específico. */}
            </div>
        </header>
    );
};
export default Header;