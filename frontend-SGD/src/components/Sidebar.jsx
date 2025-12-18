// frontend-vite/src/components/Sidebar.jsx
import React from 'react';
import { useAuth } from '../context/AuthContext'; // <-- Importe
import './Sidebar.css';

const Sidebar = ({ activeSection, setActiveSection }) => {
    const { isAdmin } = useAuth();
    
    // Mostra 'Usuários' apenas se for Admin
    let navItems = ['Despesas', 'Categorias'];
    if (isAdmin) {
      navItems = ['Usuários', ...navItems]; 
    }
    
    return (
        <div className="sidebar" style={{
            width: '200px', minHeight: '100vh', backgroundColor: '#121212', padding: '20px', borderRight: '1px solid #333'
        }}>
            <h2>Facilita a vida</h2>
            <nav className="nav-menu" style={{marginTop: '30px', display: 'flex', flexDirection: 'column', gap: '10px'}}>
                {navItems.map(item => (
                    <button
                        key={item}
                        className={activeSection === item ? 'active' : ''}
                        onClick={() => setActiveSection(item)}
                        style={{
                            padding: '10px', textAlign: 'left', backgroundColor: activeSection === item ? '#4caf50' : 'transparent', 
                            color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', transition: 'background-color 0.2s'
                        }}
                    >
                        {item}
                    </button>
                ))}
            </nav>
        </div>
    );
};
export default Sidebar;