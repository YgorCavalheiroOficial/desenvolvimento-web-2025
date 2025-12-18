import { pool } from '../database/db.js';
import bcrypt from 'bcrypt';

const saltRounds = 10; 

// POST: Cria um novo usuário (Requer ADMIN)
export const criarUsuario = async (req, res) => {
    const { nome, email, senha, role } = req.body;
    
    if (!nome || !email || !senha || !role) {
        return res.status(400).json({ erro: 'Todos os campos são obrigatórios.' });
    }

    try {
        const senha_hash = await bcrypt.hash(senha, saltRounds);

        const result = await pool.query(
            "INSERT INTO usuarios (nome, email, senha_hash, role) VALUES ($1, $2, $3, $4) RETURNING id, nome, email, role",
            [nome, email, senha_hash, role]
        );

        res.status(201).json({ 
            mensagem: 'Usuário criado com sucesso.',
            usuario: result.rows[0]
        });

    } catch (error) {
        if (error.code === '23505') {
            return res.status(409).json({ erro: 'Este e-mail já está em uso.' });
        }
        console.error("Erro ao criar usuário:", error);
        res.status(500).json({ erro: 'Erro interno ao criar usuário.' });
    }
};

// GET: Lista todos os usuários (Requer ADMIN)
export const listarUsuarios = async (req, res) => {
    try {
        // Não retornar o hash da senha!
        const { rows } = await pool.query("SELECT id, nome, email, role FROM usuarios ORDER BY id");
        res.json(rows);
    } catch (error) {
        console.error("Erro ao listar usuários:", error);
        res.status(500).json({ erro: 'Erro interno ao listar usuários.' });
    }
};

// Implementação: atualizarUsuario e deletarUsuario
export const atualizarUsuario = async (req, res) => {
    const { id } = req.params;
    const { nome, email, senha, role } = req.body;
    
    try {
        let updateQuery = "UPDATE usuarios SET nome = $1, email = $2, role = $3";
        let queryParams = [nome, email, role];
        let paramCount = 4; // Começamos no $4 se a senha for incluída

        // Se a senha for fornecida, gere um novo hash
        if (senha) {
            const senha_hash = await bcrypt.hash(senha, saltRounds);
            updateQuery += `, senha_hash = $${paramCount}`;
            queryParams.push(senha_hash);
            paramCount++;
        }
        
        // Finaliza a query com o ID
        updateQuery += ` WHERE id = $${paramCount} RETURNING id, nome, email, role`;
        queryParams.push(id);

        const result = await pool.query(updateQuery, queryParams);

        if (result.rows.length === 0) {
            return res.status(404).json({ erro: "Usuário não encontrado." });
        }

        res.json({ 
            mensagem: `Usuário ID ${id} atualizado com sucesso.`,
            usuario: result.rows[0]
        });

    } catch (error) {
        // Erro de e-mail duplicado
        if (error.code === '23505') {
            return res.status(409).json({ erro: 'Este e-mail já está em uso por outro usuário.' });
        }
        console.error("Erro ao atualizar usuário:", error);
        res.status(500).json({ erro: 'Erro interno ao atualizar usuário.' });
    }
};


// DELETE: Deleta um usuário por ID (Requer ADMIN)
export const deletarUsuario = async (req, res) => {
    const { id } = req.params;

    // Impede que o Admin delete a si mesmo (Segurança básica)
    if (req.user.id == id) {
        return res.status(403).json({ erro: "Você não pode deletar sua própria conta via CRUD de Admin." });
    }
    
    // Pegamos um "client" do pool para gerenciar a transação
    const client = await pool.connect();

    try {
        await client.query('BEGIN'); // Inicia a transação

        // 1. Deleta todas as despesas vinculadas a este usuário
        await client.query("DELETE FROM despesa WHERE usuario_id = $1", [id]);

        // 2. Agora que não há mais vínculos, deleta o usuário
        const result = await client.query("DELETE FROM usuarios WHERE id = $1", [id]);

        if (result.rowCount === 0) {
            await client.query('ROLLBACK'); // Desfaz se o usuário não existir
            return res.status(404).json({ erro: "Usuário não encontrado." });
        }

        await client.query('COMMIT'); // Confirma as duas exclusões no banco
        res.json({ mensagem: `Usuário ID ${id} e suas despesas foram deletados com sucesso.` });

    } catch (error) {
        await client.query('ROLLBACK'); // Em caso de erro, desfaz tudo o que foi feito acima
        console.error("Erro ao deletar usuário:", error);
        res.status(500).json({ erro: 'Erro interno ao deletar usuário e seus vínculos.' });
    } finally {
        client.release(); // Libera o cliente de volta para o pool
    }
};