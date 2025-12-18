import { Pool } from "pg"; // Importa, da biblioteca "pg", a classe Pool
import dotenv from "dotenv"; // Importa o dotenv, que lê o arquivo .env e coloca as chaves/valores dentro de process.env

dotenv.config(); // Executa a leitura do .env.

// Verifica se estamos no Render (eles definem NODE_ENV como production por padrão)
const isProduction = process.env.NODE_ENV === "production";


const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  
  // Se não houver connectionString, ele tenta usar estes campos:
  host: process.env.PGHOST || "localhost",
  port: process.env.PGPORT || "5432",
  database: process.env.PGDATABASE || "sistema_de_gerenciamento_de_despesas_api_db",
  user: process.env.PGUSER || "postgres",
  password: process.env.PGPASSWORD || "postgres",

  // No Render (produção), o SSL é obrigatório para o banco de dados
  ssl: isProduction ? { rejectUnauthorized: false } : false
});

export { pool };
