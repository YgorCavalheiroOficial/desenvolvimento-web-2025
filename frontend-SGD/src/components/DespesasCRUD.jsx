// frontend-vite/src/components/DespesasCRUD.jsx
import React, { useState, useEffect } from 'react';
import api from '../api';
import { useAuth } from '../context/AuthContext'; // Para pegar o ID do usuário logado
import './CRUD.css';

const DespesasCRUD = () => {
    const { user, isAdmin } = useAuth();
    const [despesas, setDespesas] = useState([]);
    const [categorias, setCategorias] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Estados do Formulário
    const [formTitulo, setFormTitulo] = useState('');
    const [formValor, setFormValor] = useState('');
    const [formData, setFormData] = useState('');
    const [formCategoriaId, setFormCategoriaId] = useState('');
    const [formUsuarioId, setFormUsuarioId] = useState(user.id); // Default para o usuário logado

    const [isEditing, setIsEditing] = useState(false);
    const [editingId, setEditingId] = useState(null);

    // --- CARREGAMENTO DE DADOS (Despesas e Categorias) ---
    const fetchDados = async () => {
        setLoading(true);
        try {
            // 1. Carregar Despesas (A rota GET já filtra pelo ID do usuário se não for Admin)
            const despesasRes = await api.get('/despesas');
            setDespesas(despesasRes.data);

            // 2. Carregar Categorias (Necessário para o campo de seleção)
            const categoriasRes = await api.get('/categorias_despesa');
            setCategorias(categoriasRes.data);

            setError(null);
        } catch (err) {
            console.error("Erro ao carregar dados:", err);
            setError(err.response?.data?.erro || 'Falha ao carregar despesas ou categorias.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDados();
        // Garante que o ID do usuário logado é o padrão (para Admin, ele pode mudar depois)
        setFormUsuarioId(user.id);
    }, [user.id]);

    // --- FUNÇÃO DE FORMATAÇÃO E LIMPEZA ---
    const formatarValor = (valorString) => {
        if (!valorString) return 'R$ 0.00';

        // 1. Converte para string e substitui vírgula por ponto (caso o BD tenha usado vírgula)
        let limpo = String(valorString).replace(',', '.');

        // 2. Remove quaisquer caracteres não numéricos (exceto o ponto decimal)
        limpo = limpo.replace(/[^\d.]/g, '');

        // 3. Converte para float. Se falhar, retorna 0
        const valorNumerico = parseFloat(limpo) || 0;

        // 4. Formata para duas casas decimais
        return `R$ ${valorNumerico.toFixed(2)}`;
    };

    // --- FUNÇÕES CRUD (CRIAR/EDITAR) ---
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        // Prepara os dados, garantindo que o valor é um número
        const data = {
            categoria_id: formCategoriaId,
            titulo: formTitulo,
            data: formData
        };

        if (formValor !== '') {
            // Garante que o valor é convertido para float (com ponto) antes do envio
            // Nota: O input com type="number" já deve ter um ponto se o idioma do navegador for EN/PT-BR
            data.valor = parseFloat(formValor.replace(',', '.'));
        }

        if (formData) {
            // Se a data ainda estiver no formato dd/mm/aaaa, converta para YYYY-MM-DD antes de enviar
            if (formData.includes('/')) {
                const [dia, mes, ano] = formData.split('/');
                data.data = `${ano}-${mes}-${dia}`;
            } else {
                data.data = formData; // Assume que já está YYYY-MM-DD se não tem barras
            }
        }
        if (isEditing) {
            if (isAdmin) {
                // Se for Admin, ele pode alterar o proprietário, então inclua
                data.usuario_id = formUsuarioId;
            }
            // Se não for Admin, simplesmente não inclua `usuario_id` no `data`

        } else {
            // Na CRIAÇÃO, SEMPRE envie o ID do usuário (o padrão é o logado)
            data.usuario_id = formUsuarioId;
        }

        try {
            if (isEditing) {
                // CORREÇÃO: Mudar de PUT para PATCH (Atualização Parcial)
                await api.patch(`/despesas/${editingId}`, data);
            } else {
                await api.post('/despesas', data);
            }

            // Limpa e recarrega
            setFormTitulo('');
            setFormValor('');
            setFormData('');
            setFormCategoriaId('');
            setFormUsuarioId(user.id); // Reset para o usuário logado
            setIsEditing(false);
            setEditingId(null);
            cancelEditing();
            fetchDados();

        } catch (err) {
            const msg = err.response?.data?.erro || 'Erro na operação. Verifique os campos.';
            setError(msg);
        }
    };

    // --- FUNÇÃO DELETAR ---
    const handleDelete = async (id) => {
        if (!window.confirm(`Tem certeza que deseja deletar a despesa ID ${id}?`)) return;
        setError(null);
        try {
            // A rota DELETE no backend já verifica se o item pertence ao usuário logado
            await api.delete(`/despesas/${id}`);
            fetchDados();
        } catch (err) {
            const msg = err.response?.data?.erro || 'Erro ao deletar (Pode não ser sua).';
            setError(msg);
        }
    };

    if (loading) return <div>Carregando despesas...</div>;

    // --- FUNÇÃO PARA INICIAR EDIÇÃO --
    const startEditing = (despesa) => {
        setIsEditing(true);
        setEditingId(despesa.id);

        // Seu bloco de limpeza (correto)
        let valorLimpo = String(despesa.valor)
            .replace('R$', '')
            .trim()
            .replace(',', '.'); // Troca a vírgula por ponto decimal

        if (valorLimpo === '') valorLimpo = '0';
        // [FIM DO BLOCO CRÍTICO]

        // 1. Preenche os campos do formulário
        setFormTitulo(despesa.titulo);

        // 2. CORREÇÃO: Preenche o valor com o valor limpo e com ponto decimal (para o input type="number")
        // Você estava usando: setFormValor(String(despesa.valor));
        setFormValor(valorLimpo); // <--- DEVE USAR A VARIÁVEL LIMPA

        // 3. Preenche a data (formato yyyy-mm-dd para input type="date")
        setFormData(despesa.data.split('T')[0]);

        // 4. Converte e preenche a categoria (deve ser um número)
        setFormCategoriaId(Number(despesa.categoria_id));

        // 5. Preenche o ID do usuário da despesa (importante para Admin)
        setFormUsuarioId(Number(despesa.usuario_id));

        setError(null);
    };

    // --- FUNÇÃO PARA CANCELAR EDIÇÃO ---
    const cancelEditing = () => {
        setIsEditing(false);
        setEditingId(null);
        setFormTitulo('');
        setFormValor('');
        setFormData('');
        setFormCategoriaId('');
        setFormUsuarioId(user.id); // Reseta o ID do usuário para o logado
        setError(null);
    };

    return (
        <div className="despesas-crud">
            <h1>Gerenciamento de Despesas</h1>

            {error && <div className="error-message">{error}</div>}

            {/* FORMULÁRIO */}
            <form onSubmit={handleSubmit} className="crud-form">
                <h2>{isEditing ? `Editar Despesa #${editingId}` : 'Criar Nova Despesa'}</h2>


                {/* 1. Seleção de Categoria */}
                <select
                    value={formCategoriaId}
                    onChange={(e) => setFormCategoriaId(Number(e.target.value))}
                    required
                >
                    <option value="">Selecione a Categoria</option>
                    {categorias.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.nome}</option>
                    ))}
                </select>

                {/* 2. Campo de Título */}
                <input
                    type="text"
                    placeholder="Título da Despesa"
                    value={formTitulo}
                    onChange={(e) => setFormTitulo(e.target.value)}
                    required
                />

                {/* 3. Campo de Valor */}
                <input
                    type="number"
                    placeholder="Valor (R$)"
                    value={formValor}
                    onChange={(e) => setFormValor(e.target.value)}
                    required
                />

                {/* 4. Campo de Data */}
                <input
                    type="date"
                    value={formData}
                    onChange={(e) => setFormData(e.target.value)}
                    required
                />

                {/* 5. Campo de Usuário ID (Visível APENAS para Admin) */}
                {isAdmin && (
                    <input
                        type="number"
                        placeholder={`ID do Usuário (Atual: ${user.id})`}
                        value={formUsuarioId}
                        onChange={(e) => setFormUsuarioId(Number(e.target.value))}
                        min="1"
                    />
                )}

                <button type="submit">
                    {isEditing ? 'Salvar Despesa' : 'Criar Despesa'}
                </button>
                {/* ... (Botão Cancelar Edição) */}
            </form>

            {/* TABELA DE LISTAGEM */}
            <h2 style={{ marginTop: '40px' }}>Lista de Despesas</h2>

            <table className="crud-table">
                {/* ... (Cabeçalho da Tabela) ... */}
                <thead>
                    <tr>
                        <th>ID da Despesa</th>
                        <th>ID do Usuário</th>
                        <th>Categoria da Despesa</th>
                        <th> Título </th>
                        <th>Valor</th>
                        <th>Data de Criação</th>
                        <th>Ação</th>
                    </tr>
                </thead>
                <tbody>
                    {despesas.map(d => (
                        <tr key={d.id}>
                            <td>{d.id}</td>
                            <td>{d.usuario_id}</td>
                            <td>{categorias.find(c => c.id === d.categoria_id)?.nome || 'N/A'}</td>
                            <td>{d.titulo}</td>

                            {/* APLICAÇÃO DA FUNÇÃO DE FORMATAÇÃO */}
                            <td>{formatarValor(d.valor)}</td>

                            <td>{d.data.split('T')[0]}</td>
                            <td>
                                {/* Ações de Editar/Deletar */}
                                <div className="action-buttons">
                                    <button
                                        className="edit-button"
                                        // CORRIGIDO: Chamar startEditing para carregar os dados no formulário
                                        onClick={() => startEditing(d)}
                                        // Opcional: Desabilitar se não for Admin E a despesa não pertencer ao usuário logado
                                        disabled={!isAdmin && d.usuario_id !== user.id}
                                    >
                                        Editar
                                    </button>
                                    <button
                                        className="delete-button"
                                        onClick={() => handleDelete(d.id)}
                                        // Opcional: Desabilitar se não for Admin E a despesa não pertencer ao usuário logado
                                        disabled={!isAdmin && d.usuario_id !== user.id}
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

export default DespesasCRUD;