// frontend-vite/src/components/ContentArea.jsx
import React from 'react';
import { useAuth } from '../context/AuthContext';
import './ContentArea.css';

// Importa os três componentes CRUD
import CategoriasCRUD from './CategoriasCRUD';
import DespesasCRUD from './DespesasCRUD'; 
import UsuariosCRUD from './UsuariosCRUD'; 

const ContentArea = ({ activeSection }) => {
    const { isAdmin } = useAuth();
    
    const renderContent = () => {
        switch (activeSection) {
            case 'Despesas':
                return <DespesasCRUD />;

            case 'Categorias':
                return <CategoriasCRUD />;

            case 'Usuários':
                // Garante que só o Admin veja o CRUD de Usuários
                if (isAdmin) {
                    return <UsuariosCRUD />;
                }
                return <div className="access-denied">❌ Acesso negado. Apenas administradores podem gerenciar usuários.</div>;

            default:
                return <div className="placeholder">Bem-vindo(a) ao seu Painel de Controle.</div>;
        }
    };

    return (
        <main className="content-area">
            {renderContent()}
        </main>
    );
};

export default ContentArea;