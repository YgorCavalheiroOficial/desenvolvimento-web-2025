import React, { useState } from 'react';
import { useAuth } from './context/AuthContext';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import ContentArea from './components/ContentArea'; 
import Login from './components/Login';
import './App.css'; // Estilos

const AppContent = ({ activeSection, setActiveSection }) => {
    return (
        <div className="app-container">
            <Sidebar 
                activeSection={activeSection} 
                setActiveSection={setActiveSection} 
            />
            
            <div className="main-content">
                <Header title={activeSection} />
                <ContentArea activeSection={activeSection} />
            </div>
        </div>
    );
};

function App() {
    const { token, isLoading } = useAuth(); 
    const [activeSection, setActiveSection] = useState('Despesas'); 

    const isAuthenticated = !!token;

    if (isLoading) {
        return (
            <div style={{
                display: 'flex', justifyContent: 'center', alignItems: 'center', 
                minHeight: '100vh', backgroundColor: '#1e1e1e', color: 'white'
            }}>
                Carregando dados de sessão...
            </div>
        );
    }
  
    if (!isAuthenticated) {
        return <Login />;
    }

    return (
        <AppContent 
            activeSection={activeSection} 
            setActiveSection={setActiveSection} 
        />
    );
}

export default App;