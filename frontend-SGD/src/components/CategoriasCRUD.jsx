import React, { useState, useEffect } from 'react';
import api from '../api'; // Importa a instância configurada do axios
import './CRUD.css';

const CategoriasCRUD = () => {
    const [categorias, setCategorias] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Estados do Formulário
    const [formNome, setFormNome] = useState('');
    const [formDescricao, setFormDescricao] = useState('');

    // Estado para edição
    const [isEditing, setIsEditing] = useState(false);
    const [editingId, setEditingId] = useState(null);

    // --- FUNÇÃO DE CARREGAMENTO DE DADOS ---
    const fetchCategorias = async () => {
        setLoading(true);
        try {
            // A API já envia o Token JWT automaticamente, graças ao api.js
            const response = await api.get('/categorias_despesa');
            setCategorias(response.data);
            setError(null);
        } catch (err) {
            console.error("Erro ao carregar categorias:", err);
            setError('Falha ao carregar categorias. Verifique se o Backend está rodando.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategorias();
    }, []);

    // --- FUNÇÕES CRUD (CRIAR/EDITAR) ---
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        try {
            const data = { nome: formNome, descricao: formDescricao };

            if (isEditing) {
                // Requisição PUT para atualização
                await api.put(`/categorias_despesa/${editingId}`, data);
            } else {
                // Requisição POST para criação
                await api.post('/categorias_despesa', data);
            }

            // Limpa o formulário e recarrega a lista
            setFormNome('');
            setFormDescricao('');
            setIsEditing(false);
            setEditingId(null);
            fetchCategorias();

        } catch (err) {
            const msg = err.response?.data?.erro || 'Erro na operação de ' + (isEditing ? 'edição' : 'criação');
            setError(msg);
        }
    };

    // --- FUNÇÃO DELETAR ---
    const handleDelete = async (id) => {
        if (!window.confirm(`Tem certeza que deseja deletar a categoria ID ${id}?`)) return;
        setError(null);
        try {
            await api.delete(`/categorias_despesa/${id}`);
            fetchCategorias(); // Recarrega a lista
        } catch (err) {
            const msg = err.response?.data?.erro || 'Erro ao deletar categoria.';
            setError(msg);
        }
    };

    // --- FUNÇÃO PARA INICIAR EDIÇÃO ---
    const handleEdit = (categoria) => {
        setFormNome(categoria.nome);
        setFormDescricao(categoria.descricao);
        setEditingId(categoria.id);
        setIsEditing(true);
    };


    return (
        <div className="categorias-crud">
            <h1>Gerenciamento de Categorias</h1>

            {error && <div className="error-message">{error}</div>}

            {/* FORMULÁRIO DE CRIAÇÃO/EDIÇÃO */}
            <form onSubmit={handleSubmit} className="crud-form">
                <h2>{isEditing ? `Editar Categoria #${editingId}` : 'Criar Nova Categoria'}</h2>

                <input
                    type="text"
                    placeholder="Nome da Categoria (Ex: Alimentação)"
                    value={formNome}
                    onChange={(e) => setFormNome(e.target.value)}
                    required
                />

                <input
                    type="text"
                    placeholder="Descrição"
                    value={formDescricao}
                    onChange={(e) => setFormDescricao(e.target.value)}
                    required
                />

                <button type="submit">
                    {isEditing ? 'Salvar Alterações' : 'Criar Categoria'}
                </button>

                {isEditing && (
                    <button type="button" onClick={() => {
                        setIsEditing(false); setEditingId(null); setFormNome(''); setFormDescricao('');
                    }} style={{ backgroundColor: '#c44' }}>
                        Cancelar Edição
                    </button>
                )}
            </form>

            <h2 style={{ marginTop: '40px' }}>Lista de Categorias</h2>

            {loading ? (
                <p>Carregando categorias...</p>
            ) : (
                <table className="crud-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Nome</th>
                            <th>Descrição</th>
                            <th>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {categorias.map(cat => (
                            <tr key={cat.id}>
                                <td>{cat.id}</td>
                                <td>{cat.nome}</td>
                                <td>{cat.descricao}</td>
                                <td>
                                    <div className="action-buttons">
                                        <button
                                            className="edit-button"
                                            onClick={() => handleEdit(cat)}
                                        >
                                            Editar
                                        </button>
                                        <button
                                            className="delete-button"
                                            onClick={() => handleDelete(cat.id)}
                                        >
                                            Deletar
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default CategoriasCRUD;