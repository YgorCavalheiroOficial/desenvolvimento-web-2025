// STATUS HTTP (os principais usados aqui)
// - 200 OK: requisição deu certo, respondemos com dados.
// - 201 Created: criação bem-sucedida (retornamos o recurso criado).
// - 204 No Content: operação deu certo, mas sem corpo de resposta (ex.: DELETE).
// - 400 Bad Request: dados inválidos enviados pelo cliente.
// - 404 Not Found: recurso não encontrado (ex.: id inexistente).
// - 500 Internal Server Error: erro inesperado no servidor.
import { Router } from "express";
import { pool } from "../database/db.js";

const router = Router();
// Criamos um Router. No app principal, algo como:
//   app.use("/api/categorias_despesa", router)

// -----------------------------------------------------------------------------
// LISTAR — GET /api/categorias_despesa

router.get("/", async (_req, res) => {
  try {
    // pool.query retorna um objeto; desestruturamos "rows" (array de resultados).
    const { rows } = await pool.query("SELECT * FROM categoria ORDER BY id DESC");
    res.json(rows); // Envia um array JSON com todas as categorias.
  } catch (erro) { // *CORREÇÃO: Incluí 'erro' no catch para boas práticas*
    res.status(500).json({ erro: "erro interno ao listar categorias" }); 
  }
});

// -----------------------------------------------------------------------------
// MOSTRAR — GET /api/categorias_despesa/:id
router.get("/:id", async (req, res) => {
  const id = Number(req.params.id); // tenta converter "id" para número

  // Validação de id:
  if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ erro: "id inválido" });

  try {// Consulta parametrizada (evita SQL Injection):
    const { rows } = await pool.query("SELECT * FROM categoria WHERE id = $1", [id]);

    // Se não existir primeira linha, não achamos a categoria.
    if (!rows[0]) return res.status(404).json({ erro: "não encontrado" });

    res.json(rows[0]);
  } catch (erro) { 
    res.status(500).json({ erro: "erro interno ao buscar categoria" }); 
  }
});

// -----------------------------------------------------------------------------
// CRIAR — POST /api/categorias_despesa
router.post("/", async (req, res) => {
  
  const { nome, descricao } = req.body ?? {}; // extrai chaves do corpo (ou {})

  // Regras de validação:
  // - nome precisa existir (não vazio/null/undefined)
  // - descricao precisa existir (não vazio/null/undefined)

  if (!nome || !descricao) { 
    return res.status(400).json({ erro: "nome e descrição são obrigatórios" });
  }

  try {
    // INSERT com RETURNING * devolve a linha inserida (inclui id gerado, etc.).
    const { rows } = await pool.query(
      "INSERT INTO categoria (nome, descricao) VALUES ($1, $2) RETURNING *",
      [nome, descricao] 
    );
    res.status(201).json(rows[0]); // 201 Created
  } catch (erro) { 
    res.status(500).json({ erro: "falha ao adicionar categoria" });
  }
});

// -----------------------------------------------------------------------------
// SUBSTITUIR — PUT /api/categorias_despesa/:id
router.put("/:id", async (req, res) => {
  const id = Number(req.params.id);
  const { nome, descricao } = req.body ?? {}; 

  // Validação do id
  if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ erro: "id inválido" });

  // Validação dos campos (mesmas regras do POST)
  if (!nome || !descricao) {
    return res.status(400).json({ erro: "nome e descrição são obrigatórios" });
  }

  try {
    // Atualiza SEM preservar o valor anterior: ambos os campos são substituídos.
    const { rows } = await pool.query(
      "UPDATE categoria SET nome = $1, descricao = $2 WHERE id = $3 RETURNING *",
      [nome, descricao, id]
    );

    // Se rows[0] não existe, id não foi encontrado na tabela.
    if (!rows[0]) return res.status(404).json({ erro: "não encontrado" });

    res.json(rows[0]); // categoria atualizada
  } catch (erro) { 
    res.status(500).json({ erro: "erro interno" });
  }
});

// -----------------------------------------------------------------------------
// ATUALIZAR — PATCH /api/categorias_despesa/:id
// -----------------------------------------------------------------------------
// Objetivo: atualizar APENAS os campos enviados (atualização parcial).

// Como isso funciona no SQL?
// - COALESCE(a, b) devolve "a" quando "a" NÃO é NULL; se "a" for NULL, devolve "b".
// - Estratégia: quando o cliente não envia um campo, mandamos NULL para o SQL.
//   Aí COALESCE($1, nome) mantém o "nome" que já está no banco.
router.patch("/:id", async (req, res) => {
  const id = Number(req.params.id);
  const { nome, descricao } = req.body ?? {};

  // Validação do id
  if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ erro: "id inválido" });

  // Se nenhum campo foi enviado, não há o que atualizar.
  if (nome === undefined && descricao === undefined) {
    return res.status(400).json({ erro: "envie nome e/ou a descrição" });
  }

  try {
    // Para "nome" e "descricao": usamos campo ?? null (undefined → null) para acionar o COALESCE.
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

// -----------------------------------------------------------------------------
// DELETAR — DELETE /api/categorias_despesa/:id
router.delete("/:id", async (req, res) => {
  const id = Number(req.params.id);

  // Validação do id
  if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ erro: "id inválido" });

  try {
    // RETURNING id nos permite saber se algo foi realmente apagado.
    const r = await pool.query("DELETE FROM categoria WHERE id = $1 RETURNING id", [id]);

    // r.rowCount === 0 → nenhuma linha deletada → id não existia.
    if (!r.rowCount) return res.status(404).json({ erro: "não encontrado" });

    res.status(204).end(); // Sucesso sem corpo de resposta.
  } catch (erro) { // *CORREÇÃO: Incluí 'erro' no catch*
    res.status(500).json({ erro: "erro interno" });
  }
});

export default router;