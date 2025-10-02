import express from "express";
import dotenv from "dotenv";
import categoriasDespesaRouter from "./routes/categorias_despesa.routes.js";

dotenv.config();

const app = express();

// -----------------------------------------------------------------------------
// MIDDLEWARE: interpretar JSON do corpo das requisições
// - Sem isso, req.body seria undefined quando o cliente envia JSON.
// -----------------------------------------------------------------------------
app.use(express.json());

// -----------------------------------------------------------------------------
// ROTA DE BOAS-VINDAS (GET /)
// - Retorna um “guia rápido” em JSON com os endpoints disponíveis da API.
// -----------------------------------------------------------------------------
app.get("/", (_req, res) => {
  res.json({
    LISTAR: "GET /api/categorias_despesa",
    MOSTRAR: "GET /api/categorias_despesa/:id",
    CRIAR: "POST /api/categorias_despesa  BODY: { nome: 'string', descricao: 'string' }",
    SUBSTITUIR: "PUT /api/categorias_despesa/:id  BODY: { nome: 'string', descricao: 'string' }",
    ATUALIZAR: "PATCH /api/categorias_despesa/:id  BODY: { nome?: 'string', descricao?: 'string' }",
    DELETAR: "DELETE /api/categorias_despesa/:id",
  });
});


// MONTAGEM DO ROUTER DE CATEGORIAS DE DESPESA
// CORREÇÃO: Usando a variável renomeada.
app.use("/api/categorias_despesa", categoriasDespesaRouter);

// -----------------------------------------------------------------------------
// INICIANDO O SERVIDOR
// -----------------------------------------------------------------------------
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => console.log(`http://localhost:${PORT}`));