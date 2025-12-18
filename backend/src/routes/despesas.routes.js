// backend/routes/despesas.routes.js (Código Final)

import { Router } from "express";
import { pool } from "../database/db.js";
import { verifyToken, authorizeRole } from "../middlewares/auth.js";

const router = Router();

// ----------------------------------------------------------------------------
// LISTAR — GET /api/despesas
// Admin vê todas; Usuário Comum vê apenas as suas
// ----------------------------------------------------------------------------
router.get("/", verifyToken, async (req, res) => { // verifyToken já injeta req.user
    try {
        let queryText = "SELECT * FROM despesa ORDER BY id DESC";
        const queryParams = [];

        // Lógica de Autorização: Se for 'user', filtra por ID do usuário logado
        if (req.user.role === 'comum') { 
            queryText = "SELECT * FROM despesa WHERE usuario_id = $1 ORDER BY id DESC";
            queryParams.push(req.user.id); // req.user.id vem do JWT
        }
        // Se req.user.role === 'admin', a query permanece "SELECT * FROM despesa..." 

        const { rows } = await pool.query(queryText, queryParams);
        res.json(rows);
    } catch (erro) {
        console.error("Erro ao listar despesas:", erro); 
        res.status(500).json({ erro: "erro interno ao listar despesas" });
    }
});

// ----------------------------------------------------------------------------
// MOSTRAR — GET /api/despesas/:id (Segurança OK)
// ----------------------------------------------------------------------------
router.get("/:id", verifyToken, async (req, res) => {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ erro: "id inválido" });

    let queryText = "SELECT * FROM despesa WHERE id = $1";
    const queryParams = [id];

    // Restrição: Usuário Comum só pode ver o que lhe pertence (AND usuario_id = $2)
    if (req.user.role === 'comum') {
        queryText += " AND usuario_id = $2";
        queryParams.push(req.user.id);
    }

    try {
        const { rows } = await pool.query(queryText, queryParams);

        if (!rows[0]) {
            // Se for 'user', o 404 significa que não existe OU o acesso foi negado. OK.
            return res.status(404).json({ erro: "Despesa não encontrada ou acesso negado." });
        }
        res.json(rows[0]);
    } catch (erro) {
        console.error("Erro ao buscar despesa:", erro); // Melhorar o log
        res.status(500).json({ erro: "erro interno" });
    }
});


// ----------------------------------------------------------------------------
// CRIAR — POST /api/despesas (Segurança OK)
// ----------------------------------------------------------------------------
router.post("/", verifyToken, async (req, res) => { 
    const { usuario_id, categoria_id, titulo, valor, data } = req.body;
    
    // ... (Validação de campos obrigatórios OK) ...
    if (!usuario_id || !categoria_id || !titulo || !valor || !data) {
        return res.status(400).json({ erro: "Todos os campos (usuario_id, categoria_id, titulo, valor, data) são obrigatórios." });
    }
    
    // Restrição: Usuário Comum só pode criar despesas para seu próprio ID (SEGURANÇA OK)
    if (req.user.role === 'comum' && Number(usuario_id) !== req.user.id) {
        return res.status(403).json({ erro: "Você só pode criar despesas para sua própria conta." });
    }
    
    try {
        const { rows } = await pool.query(
            "INSERT INTO despesa (usuario_id, categoria_id, titulo, valor, data) VALUES ($1, $2, $3, $4, $5) RETURNING *",
            [usuario_id, categoria_id, titulo, valor, data]
        );
        res.status(201).json(rows[0]);
    } catch (erro) {
        console.error("Erro ao criar despesa:", erro); // Melhorar o log
        res.status(500).json({ erro: "falha ao adicionar despesa" });
    }
});

// ----------------------------------------------------------------------------
// SUBSTITUIR — PUT /api/despesas/:id (Campos OBRIGATÓRIOS. Requer PATCH para opcionalidade)
// ----------------------------------------------------------------------------
router.put("/:id", verifyToken, async (req, res) => {
    const id = Number(req.params.id);
    const { usuario_id, categoria_id, titulo, valor, data } = req.body ?? {};
    
    // ... (Validação de campos e restrição de usuario_id para 'user' OK) ...
    if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ erro: "id inválido" });
  
    if (!usuario_id || !categoria_id || !titulo || !valor || !data) {
        return res.status(400).json({ erro: "Todos os campos são obrigatórios para PUT." });
    }
    
    let queryText = "UPDATE despesa SET usuario_id = $1, categoria_id = $2, titulo = $3, valor = $4, data = $5 WHERE id = $6 RETURNING *";
    const queryParams = [usuario_id, categoria_id, titulo, valor, data, id];

    // Restrição: Usuário Comum só pode modificar despesas que lhe pertencem (SEGURANÇA OK)
    if (req.user.role === 'comum') {
        if (Number(usuario_id) !== req.user.id) {
             return res.status(403).json({ erro: "Você só pode atualizar despesas para sua própria conta." });
        }
        queryText += " AND usuario_id = $7"; // Adiciona a condição de filtro no UPDATE
        queryParams.push(req.user.id);
    }
    
    try {
        const { rows } = await pool.query(queryText, queryParams);

        if (!rows[0]) {
             return res.status(404).json({ erro: "Despesa não encontrada ou acesso negado." });
        }

        res.json(rows[0]);
    } catch (erro) { 
        console.error("Erro ao substituir despesa:", erro);
        res.status(500).json({ erro: "erro interno" });
    }
});


// ----------------------------------------------------------------------------
// ATUALIZAR PARCIALMENTE — PATCH /api/despesas/:id (SEGURANÇA E LÓGICA OK)
// ----------------------------------------------------------------------------
// Esta é a rota que lida com a edição onde campos não preenchidos mantêm o valor antigo (usando COALESCE).
router.patch("/:id", verifyToken, async (req, res) => {
    const id = Number(req.params.id);
    const { usuario_id, categoria_id, titulo, valor, data } = req.body ?? {};

    if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ erro: "id inválido" });
    
    if (usuario_id === undefined && categoria_id === undefined && titulo === undefined && valor === undefined && data === undefined) {
        return res.status(400).json({ erro: "envie os dados necessários para atualização" });
    }

    // Restrição: Usuário Comum NÃO PODE alterar o campo usuario_id (SEGURANÇA OK)
    if (req.user.role === 'comum' && usuario_id !== undefined) {
        return res.status(403).json({ erro: "Você não tem permissão para alterar o proprietário da despesa." });
    }

    let queryText = "UPDATE despesa SET usuario_id = COALESCE($1, usuario_id), categoria_id = COALESCE($2, categoria_id), titulo = COALESCE($3, titulo), valor = COALESCE($4, valor), data = COALESCE($5, data) WHERE id = $6";
    const queryParams = [usuario_id ?? null, categoria_id ?? null, titulo ?? null, valor ?? null, data ?? null, id];
    
    // Adiciona a restrição de proprietário para usuários comuns (SEGURANÇA OK)
    if (req.user.role === 'comum') {
        queryText += " AND usuario_id = $7";
        queryParams.push(req.user.id);
    }

    queryText += " RETURNING *";
    
    try {
        const { rows } = await pool.query(queryText, queryParams);

        if (!rows[0]) {
            return res.status(404).json({ erro: "Despesa não encontrada ou acesso negado." });
        }
        res.json(rows[0]);
    } catch (erro) { 
        console.error("Erro ao atualizar parcialmente despesa:", erro);
        res.status(500).json({ erro: "erro interno" });
    }
});

// ----------------------------------------------------------------------------
// DELETAR — DELETE /api/despesas/:id (Segurança OK)
// ----------------------------------------------------------------------------
router.delete("/:id", verifyToken, async (req, res) => { 
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ erro: "id inválido" });
    
    let queryText = "DELETE FROM despesa WHERE id = $1 RETURNING id";
    const queryParams = [id];

    // Lógica de Autorização: Usuário Comum só pode deletar as suas despesas (SEGURANÇA OK)
    if (req.user.role === 'comum') {
        queryText = "DELETE FROM despesa WHERE id = $1 AND usuario_id = $2 RETURNING id";
        queryParams.push(req.user.id);
    }

    try {
        const r = await pool.query(queryText, queryParams);

        if (!r.rowCount) {
            return res.status(404).json({ erro: "Despesa não encontrada ou acesso negado" }); 
        }

        res.status(204).end();
    } catch (erro) {
        console.error("Erro ao deletar despesa:", erro);
        res.status(500).json({ erro: "erro interno" });
    }
});

export default router;