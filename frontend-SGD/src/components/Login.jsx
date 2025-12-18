import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import './Login.css'; // Importa os estilos

const Login = () => {
    // Estados locais para o formulário e UI
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // Obtém a função de login do contexto
    const { login } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(''); // Limpa erros anteriores
        
        if (!email || !senha) {
            setError('Preencha e-mail e senha.');
            return;
        }

        setLoading(true);

        try {
            await login(email, senha);
            // Se o login for bem-sucedido, o contexto (AuthProvider)
            // irá atualizar o estado `user`, e o App.jsx mudará a rota/visualização.
        } catch (err) {
            // O erro é o que foi lançado no AuthContext
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <form className="login-form" onSubmit={handleSubmit}>
                <h2>Acesso ao Sistema</h2>

                {/* Mensagem de Erro */}
                {error && <div className="error-message">{error}</div>}

                <input
                    type="email"
                    placeholder="E-mail"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                />
                
                <input
                    type="password"
                    placeholder="Senha"
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    required
                    disabled={loading}
                />

                <button type="submit" disabled={loading}>
                    {loading ? 'Entrando...' : 'Entrar'}
                </button>
            </form>
        </div>
    );
};

export default Login;