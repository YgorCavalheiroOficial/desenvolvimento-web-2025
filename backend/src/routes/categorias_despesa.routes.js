import { Router } from "express";
import { pool } from "../database/db.js";
import { verifyToken, authorizeRole } from "../middlewares/auth.js";

const router = Router();

router.use(verifyToken);

// LISTAR — GET /api/categorias_despesa
router.get("/", async (_req, res) => {
  try {
    const { rows } = await pool.query("SELECT * FROM categoria ORDER BY id DESC");
    res.json(rows);
  } catch (erro) { 
    res.status(500).json({ erro: "erro interno ao listar categorias" }); 
  }
});

// MOSTRAR — GET /api/categorias_despesa/:id
router.get("/:id", async (req, res) => {
  const id = Number(req.params.id); 

  // Validação de id:
  if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ erro: "id inválido" });

  try {
    const { rows } = await pool.query("SELECT * FROM categoria WHERE id = $1", [id]);

    if (!rows[0]) return res.status(404).json({ erro: "não encontrado" });

    res.json(rows[0]);
  } catch (erro) { 
    res.status(500).json({ erro: "erro interno ao buscar categoria" }); 
  }
});

// CRIAR — POST /api/categorias_despesa
router.post("/", authorizeRole('admin'), async (req, res) => {
  
  const { nome, descricao } = req.body ?? {};

  // Validação dos campos obrigatórios
  if (!nome || !descricao) { 
    return res.status(400).json({ erro: "nome e descrição são obrigatórios" });
  }

  try {
    const { rows } = await pool.query(
      "INSERT INTO categoria (nome, descricao) VALUES ($1, $2) RETURNING *",
      [nome, descricao] 
    );
    res.status(201).json(rows[0]); // 201 Created
  } catch (erro) { 
    res.status(500).json({ erro: "falha ao adicionar categoria" });
  }
});

// SUBSTITUIR — PUT /api/categorias_despesa/:id
router.put("/:id", authorizeRole('admin'), async (req, res) => {
  const id = Number(req.params.id);
  const { nome, descricao } = req.body ?? {}; 

  // Validação do id
  if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ erro: "id inválido" });

  // Validação dos campos obrigatórios
  if (!nome || !descricao) {
    return res.status(400).json({ erro: "nome e descrição são obrigatórios" });
  }

  try {
    const { rows } = await pool.query(
      "UPDATE categoria SET nome = $1, descricao = $2 WHERE id = $3 RETURNING *",
      [nome, descricao, id]
    );

    if (!rows[0]) return res.status(404).json({ erro: "não encontrado" });

    res.json(rows[0]); // categoria atualizada
  } catch (erro) { 
    res.status(500).json({ erro: "erro interno" });
  }
});

// ATUALIZAR PARCIALMENTE — PATCH /api/categorias_despesa/:id
router.patch("/:id", authorizeRole('admin'), async (req, res) => {
  const id = Number(req.params.id);
  const { nome, descricao } = req.body ?? {};

  // Validação do id
  if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ erro: "id inválido" });

  // Se nenhum campo foi enviado.
  if (nome === undefined && descricao === undefined) {
    return res.status(400).json({ erro: "envie nome e/ou a descrição" });
  }

  try {
    // COALESCE mantém o valor antigo se o novo for nulo.
    const { rows } = await pool.query(
      "UPDATE categoria SET nome = COALESCE($1, nome), descricao = COALESCE($2, descricao) WHERE id = $3 RETURNING *",
      [nome ?? null, descricao ?? null, id] 
    );

    if (!rows[0]) return res.status(404).json({ erro: "não encontrado" });

    res.json(rows[0]); // categoria parcialmente atualizada
  } catch (erro) { 
    res.status(500).json({ erro: "erro interno" });
  }
});

// DELETAR — DELETE /api/categorias_despesa/:id
router.delete("/:id", authorizeRole('admin'), async (req, res) => {
  const id = Number(req.params.id);

  // Validação do id
  if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ erro: "id inválido" });

  try {
    const r = await pool.query("DELETE FROM categoria WHERE id = $1 RETURNING id", [id]);

    if (!r.rowCount) return res.status(404).json({ erro: "não encontrado" });

    res.status(204).end(); // Sucesso sem corpo de resposta.
  } catch (erro) { 
    res.status(500).json({ erro: "erro interno" });
  }
});

export default router;