// Cria e exporta um "pool" de conexões com o PostgreSQL usando a biblioteca
// "pg" (node-postgres). O "pool" é um gerenciador de conexões que:
//   • mantém um pequeno conjunto de conexões abertas e as reutiliza;
//   • evita abrir/fechar conexão a cada consulta (fica mais rápido e estável);
//   • permite chamar pool.query(...) de qualquer parte do seu backend.

import { Pool } from "pg"; // Importa, da biblioteca "pg", a classe Pool
import dotenv from "dotenv"; // Importa o dotenv, que lê o arquivo .env e coloca as chaves/valores dentro de process.env

dotenv.config(); // Executa a leitura do .env.

// Monta as variáveis de configuração do banco.
const HOST = process.env.PGHOST || process.env.DB_HOST || "localhost";
const PORT = process.env.PGPORT || process.env.DB_PORT || "5432"; // pode ser string
const DATABASE = process.env.PGDATABASE || process.env.DB_DATABASE || "sistema_de_gerenciamento_de_despesas_api_db";
const USER = process.env.PGUSER || process.env.DB_USER || "postgres";
const PASSWORD = process.env.PGPASSWORD || process.env.DB_PASSWORD || "postgres";

// Cria o "pool" de conexões com as credenciais definidas acima.
const pool = new Pool({
  host: HOST,         // endereço do servidor Postgres (ex.: "localhost")
  port: PORT,         // porta do Postgres 
  database: DATABASE, // nome do banco 
  user: USER,         // usuário do banco 
  password: PASSWORD, // senha do usuário
});

// Exporta o pool como **export nomeado**.
export { pool };
