import { pool } from '../src/database/db.js';

// ----------------------------------------------------
// 1. POST (Criação de Despesa)
// ----------------------------------------------------
export const criarDespesa = async (req, res) => {
    // Na criação, os dados vêm do formulário
    const { usuario_id, categoria_id, titulo, valor, data } = req.body;
    
    // O ID do usuário logado é extraído do token JWT, injetado pelo verifyToken
    const usuarioLogadoId = req.user.id; 
    
    // Regra de segurança: Usuário comum (role !== 'admin') só pode criar para si.
    // Esta validação é importante, mesmo que o frontend já defina o user.id.
    if (req.user.role !== 'admin' && usuario_id !== usuarioLogadoId) {
        return res.status(403).json({ erro: "Você só pode criar despesas para sua própria conta." });
    }

    try {
        const result = await pool.query(
            "INSERT INTO despesas (usuario_id, categoria_id, titulo, valor, data) VALUES ($1, $2, $3, $4, $5) RETURNING *",
            [usuario_id, categoria_id, titulo, valor, data]
        );

        res.status(201).json(result.rows[0]);

    } catch (error) {
        console.error("Erro ao criar despesa:", error);
        res.status(500).json({ erro: 'Erro interno ao criar despesa.' });
    }
};

// ----------------------------------------------------
// 2. GET (Listagem de Despesas)
// ----------------------------------------------------
export const listarDespesas = async (req, res) => {
    // O ID do usuário logado é extraído do token JWT
    const usuarioLogadoId = req.user.id; 
    
    try {
        let query = "SELECT * FROM despesas";
        const values = [];

        // Filtra despesas pelo ID do usuário se não for Admin
        if (req.user.role !== 'admin') {
            query += " WHERE usuario_id = $1";
            values.push(usuarioLogadoId);
        }
        
        query += " ORDER BY data DESC";

        const result = await pool.query(query, values);
        res.json(result.rows);

    } catch (error) {
        console.error("Erro ao listar despesas:", error);
        res.status(500).json({ erro: 'Erro interno ao listar despesas.' });
    }
};

// ----------------------------------------------------
// 3. PUT (Atualização de Despesa - Com Atualização Dinâmica)
// ----------------------------------------------------
export const atualizarDespesa = async (req, res) => {
    const { id } = req.params;
    // Pega todos os campos que podem ser atualizados
    const { usuario_id, categoria_id, titulo, valor, data } = req.body; 
    
    const usuarioLogadoId = req.user.id; 

    try {
        // 1. Verificação de Propriedade
        const despesaOriginal = await pool.query("SELECT usuario_id FROM despesas WHERE id = $1", [id]);
        
        if (despesaOriginal.rows.length === 0) {
            return res.status(404).json({ erro: "Despesa não encontrada." });
        }
        
        const proprietarioId = despesaOriginal.rows[0].usuario_id;
        
        // Regra de Ouro: Usuário comum só edita o que lhe pertence.
        if (req.user.role !== 'admin' && proprietarioId !== usuarioLogadoId) {
            return res.status(403).json({ erro: "Você não tem permissão para editar esta despesa." });
        }

        // 2. Construção da Query de UPDATE Dinâmica
        const fields = [];
        const values = [];
        let paramCount = 1;

        if (categoria_id !== undefined && categoria_id !== null) {
            fields.push(`categoria_id = $${paramCount++}`);
            values.push(categoria_id);
        }
        if (titulo !== undefined && titulo !== null) {
            fields.push(`titulo = $${paramCount++}`);
            values.push(titulo);
        }
        if (valor !== undefined && valor !== null) {
            fields.push(`valor = $${paramCount++}`);
            values.push(parseFloat(valor));
        }
        if (data !== undefined && data !== null) {
            fields.push(`data = $${paramCount++}`);
            values.push(data);
        }
        
        // Apenas o ADMIN pode mudar o usuario_id da despesa
        if (req.user.role === 'admin' && usuario_id !== undefined && usuario_id !== null) {
            fields.push(`usuario_id = $${paramCount++}`);
            values.push(usuario_id);
        }

        if (fields.length === 0) {
            // Se chegou aqui na edição, o body estava vazio
            return res.status(400).json({ erro: "Nenhum campo válido para atualização foi fornecido." });
        }

        // Finaliza a query: WHERE id = último parâmetro
        const updateQuery = `UPDATE despesas SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`;
        values.push(id);

        const result = await pool.query(updateQuery, values);

        res.json({ 
            mensagem: "Despesa atualizada com sucesso.", 
            despesa: result.rows[0] 
        });

    } catch (error) {
        console.error("Erro ao atualizar despesa:", error);
        res.status(500).json({ erro: 'Erro interno ao atualizar despesa.' });
    }
};

// ----------------------------------------------------
// 4. DELETE (Deleção de Despesa)
// ----------------------------------------------------
export const deletarDespesa = async (req, res) => {
    const { id } = req.params;
    const usuarioLogadoId = req.user.id; 

    try {
        // Verifica se a despesa existe e se o usuário logado é o dono (ou admin)
        const despesaOriginal = await pool.query("SELECT usuario_id FROM despesas WHERE id = $1", [id]);
        
        if (despesaOriginal.rows.length === 0) {
            return res.status(404).json({ erro: "Despesa não encontrada." });
        }
        
        const proprietarioId = despesaOriginal.rows[0].usuario_id;
        
        // Impede deleção se não for Admin E a despesa não pertencer ao usuário logado
        if (req.user.role !== 'admin' && proprietarioId !== usuarioLogadoId) {
            return res.status(403).json({ erro: "Você não tem permissão para deletar esta despesa." });
        }

        // Deleta
        const result = await pool.query("DELETE FROM despesas WHERE id = $1", [id]);

        if (result.rowCount === 0) {
            // Este status 404 é redundante devido à verificação acima, mas mantido por segurança.
            return res.status(404).json({ erro: "Despesa não encontrada para deleção." });
        }

        res.json({ mensagem: `Despesa ID ${id} deletada com sucesso.` });

    } catch (error) {
        console.error("Erro ao deletar despesa:", error);
        res.status(500).json({ erro: 'Erro interno ao deletar despesa.' });
    }
};