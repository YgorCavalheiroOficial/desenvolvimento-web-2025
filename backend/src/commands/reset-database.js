// Chama o programa de linha de comando do PostgreSQL chamado **psql**
// para executar um arquivo SQL (banco.sql) que **apaga e recria o banco**, além
// de criar tabelas e inserir dados de exemplo.

// - usa Node.js para rodar um programa externo (psql);
// - lê variáveis do arquivo .env (por exemplo, usuário/senha do banco);
// - imprime mensagens claras no terminal;
// - força a leitura do arquivo SQL como UTF-8 (evita erros de acentuação no Windows).

import { execFileSync } from 'node:child_process'; // "execFileSync": executa um programa externo e ESPERA ele terminar (modo síncrono).
import path from 'node:path'; // "path": ajuda a montar caminhos de arquivo/pasta de forma segura (Windows/Linux/Mac).
import fs from 'node:fs'; // "fs": permite checar se um arquivo existe, ler/gravar etc.
import dotenv from 'dotenv'; // "dotenv": lê o arquivo .env e joga as variáveis para dentro de process.env.


dotenv.config(); // Carrega as variáveis do .env (se não existir, tudo bem: usamos padrões).

const PSQL       = process.env.PSQL_PATH || 'psql';           // caminho do psql (ou só 'psql' se estiver no PATH do sistema)
const PGHOST     = process.env.DB_HOST  || process.env.PGHOST || 'localhost'; // endereço do servidor do Postgres
const PGPORT     = process.env.DB_PORT  || process.env.PGPORT || '5432';      // porta do Postgres
const PGUSER     = process.env.DB_USER  || process.env.PGUSER || 'postgres';  // usuário do Postgres
const PGPASSWORD = process.env.DB_PASSWORD || process.env.PGPASSWORD || 'postgres'; // senha do Postgres


const sqlFile = path.resolve(process.cwd(), 'src', 'database', 'banco.sql');

// Se o arquivo não existir, não adianta continuar: avisamos e saímos do programa.
if (!fs.existsSync(sqlFile)) {
  console.error('❌ Arquivo SQL não encontrado em:', sqlFile);
  process.exit(1); // 1 = deu erro (por convenção)
}
// MONTANDO A LINHA DE COMANDO DO PSQL (EM PARTES)

const args = [
  '--no-psqlrc', // → ignora configurações do arquivo .psqlrc (evita mudanças inesperadas, como encoding)
  '-v', 'ON_ERROR_STOP=1', // → se der qualquer erro SQL, pare imediatamente
  '-h', PGHOST, //  → host do Postgres 
  '-p', PGPORT, //  → porta do Postgres 
  '-U', PGUSER, //  → usuário do Postgres 
  '-d', 'postgres', // → conecta no banco "postgres" 
  '-f', sqlFile // → caminho do arquivo SQL a ser executado
];
try {
  console.log('> Executando reset do banco...');
  console.log(`  psql: ${PSQL}`);
  console.log(`  conexão: host=${PGHOST} port=${PGPORT} user=${PGUSER}`);
  console.log(`  arquivo: ${sqlFile}`);

  // execFileSync(programa, argumentos, opções)
  // - "programa"  → aqui é o psql (ex.: 'psql' ou 'C:\\...\\psql.exe')
  // - "argumentos" → o array "args" detalhado acima
  execFileSync(PSQL, args, {
    stdio: 'inherit',   // tudo o que o psql escrever (logs/erros) aparece no SEU terminal. (sem isso, você não veria a saída do psql em tempo real)
    env: {
      ...process.env,          // mantém suas variáveis de ambiente atuais
      PGPASSWORD,              // senha do Postgres (evita prompt interativo)
      PGCLIENTENCODING: 'UTF8' // força o psql a interpretar ENTRADA como UTF-8 (útil no Windows)
    }
  });

  // Se chegamos aqui, o psql terminou sem erros (graças ao ON_ERROR_STOP=1).
  console.log('> ✅ Reset finalizado com sucesso.');

} catch (err) {
  // TRATAMENTO DE ERROS
  if (err.code === 'ENOENT') {
    console.error('❌ psql não encontrado.');
    console.error('   O que fazer:');
    console.error('   1) Instale o PostgreSQL e garanta que o "psql" está no PATH;');
    console.error('   2) OU defina PSQL_PATH no .env com o caminho completo do psql.exe;');
  } else {
    // Qualquer outro erro: senha errada, host/porta inválidos, SQL com erro etc.
    console.error('❌ Falha ao executar o reset:', err.message);
  }
  
  // Encerra o script com código de erro (1).
  process.exit(1);
}