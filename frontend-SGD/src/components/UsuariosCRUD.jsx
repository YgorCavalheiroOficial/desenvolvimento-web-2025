import React, { useState, useEffect } from 'react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import './CRUD.css'; 

const UsuariosCRUD = () => {
    // Pega as informações do usuário logado (necessário para impedir que ele se delete/edite)
    const { user, isAdmin } = useAuth(); 
    
    const [usuarios, setUsuarios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Estados do Formulário
    const [formNome, setFormNome] = useState('');
    const [formEmail, setFormEmail] = useState('');
    const [formSenha, setFormSenha] = useState(''); // Senha em texto simples
    const [formRole, setFormRole] = useState('comum'); 

    // Estados de Edição
    const [isEditing, setIsEditing] = useState(false);
    const [editingId, setEditingId] = useState(null);

    // --- CARREGAMENTO DE DADOS ---
    const fetchUsuarios = async () => {
        if (!isAdmin) {
            setError('Você não tem permissão para visualizar usuários.');
            return;
        }
        setLoading(true);
        try {
            const response = await api.get('/usuarios');
            setUsuarios(response.data);
            setError(null);
        } catch (err) {
            console.error("Erro ao carregar usuários:", err);
            setError(err.response?.data?.erro || 'Falha ao carregar lista de usuários.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsuarios();
    }, [isAdmin]);

    // --- FUNÇÕES DE EDIÇÃO/CRIAÇÃO ---
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        // Prepara os dados. A senha só é enviada se estiver sendo criada OU se for preenchida na edição.
        const data = {
            nome: formNome,
            email: formEmail,
            role: formRole,
        };

        if (formSenha) {
            data.senha = formSenha; // O backend fará o hash se o campo não estiver vazio
        }
        
        // Validação básica
        if (!data.nome || !data.email || !data.role || (!isEditing && !data.senha)) {
            setError('Preencha nome, e-mail, perfil e senha (obrigatória na criação).');
            return;
        }

        try {
            if (isEditing) {
                // Rota PUT para atualização
                await api.put(`/usuarios/${editingId}`, data);
            } else {
                // Rota POST para criação
                await api.post('/usuarios', data);
            }

            // Limpa o formulário e recarrega
            cancelEditing(); // Função para limpar e resetar os estados
            fetchUsuarios();

        } catch (err) {
            const msg = err.response?.data?.erro || 'Erro na operação de criação/edição. Verifique os campos.';
            setError(msg);
        }
    };

    // --- FUNÇÃO DE DELEÇÃO ---
    const handleDelete = async (id) => {
        // user.id é o ID do admin logado, ele não pode se deletar.
        if (id === user.id) {
             setError("Você não pode deletar sua própria conta via CRUD de Admin.");
             return;
        }
        
        if (!window.confirm(`Tem certeza que deseja deletar o Usuário ID ${id}? Esta ação é irreversível.`)) return;
        setError(null);
        
        try {
            await api.delete(`/usuarios/${id}`);
            fetchUsuarios(); 
        } catch (err) {
            const msg = err.response?.data?.erro || 'Erro ao deletar usuário (Verifique a permissão).';
            setError(msg);
        }
    };

    // --- FUNÇÕES DE CONTROLE DE EDIÇÃO ---
    const startEditing = (usuario) => {
        setIsEditing(true);
        setEditingId(usuario.id);

        setFormNome(usuario.nome);
        setFormEmail(usuario.email);
        setFormRole(usuario.role);
        setFormSenha(''); // Limpa a senha (opcional na atualização)
        setError(null);
    };

    const cancelEditing = () => {
        setIsEditing(false);
        setEditingId(null);
        setFormNome(''); setFormEmail(''); setFormSenha(''); setFormRole('comum');
        setError(null);
    };

    if (!isAdmin) return <div className="access-denied">Acesso restrito.</div>;
    if (loading) return <div>Carregando usuários...</div>;

    return (
        <div className="usuarios-crud">
            <h1>Gerenciamento de Usuários (ADMIN)</h1>
            {error && <div className="error-message">{error}</div>}

            {/* FORMULÁRIO DE CRIAÇÃO/EDIÇÃO */}
            <form onSubmit={handleSubmit} className="crud-form">
                <h2>{isEditing ? `Editar Usuário #${editingId}` : 'Criar Novo Usuário'}</h2>

                <input type="text" placeholder="Nome" value={formNome} onChange={(e) => setFormNome(e.target.value)} required />
                <input type="email" placeholder="E-mail" value={formEmail} onChange={(e) => setFormEmail(e.target.value)} required />

                {/* Senha: Obrigatória na criação, opcional na edição */}
                <input 
                    type="password" 
                    placeholder={isEditing ? 'Nova Senha (opcional)' : 'Senha'} 
                    value={formSenha} 
                    onChange={(e) => setFormSenha(e.target.value)} 
                    required={!isEditing} 
                />

                {/* Seleção de Perfil */}
                <select value={formRole} onChange={(e) => setFormRole(e.target.value)} required>
                    <option value="comum">Comum</option>
                    <option value="admin">Administrador</option>
                </select>
                
                <div style={{ flex: '1 1 100%', display: 'flex', gap: '10px' }}>
                    <button type="submit">
                        {isEditing ? 'Salvar Alterações' : 'Criar Usuário'}
                    </button>
                    
                    {isEditing && (
                        <button type="button" onClick={cancelEditing} className="cancel-button">
                            Cancelar Edição
                        </button>
                    )}
                </div>
            </form>

            {/* TABELA DE LISTAGEM */}
            <h2 style={{ marginTop: '40px' }}>Lista de Usuários</h2>
            <table className="crud-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Nome</th>
                        <th>E-mail</th>
                        <th>Perfil (Role)</th>
                        <th>Ações</th>
                    </tr>
                </thead>
                <tbody>
                    {usuarios.map(u => (
                        <tr key={u.id}>
                            <td>{u.id}</td>
                            <td>{u.nome}</td>
                            <td>{u.email}</td>
                            <td>{u.role}</td>
                            <td>
                                <div className="action-buttons">
                                    <button
                                        className="edit-button"
                                        onClick={() => startEditing(u)}
                                        disabled={u.id === user.id} 
                                    >
                                        Editar
                                    </button>
                                    <button
                                        className="delete-button"
                                        onClick={() => handleDelete(u.id)}
                                        disabled={u.id === user.id} 
                                    >
                                        Deletar
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default UsuariosCRUD;