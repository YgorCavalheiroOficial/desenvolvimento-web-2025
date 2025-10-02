\echo ' '
\echo '--- Resetando banco Sistema_de_Gerenciamento_de_Despesas_api_db ---'

\encoding UTF8

SET client_encoding = 'UTF8';

\set ON_ERROR_STOP on

DROP DATABASE IF EXISTS sistema_de_gerenciamento_de_despesas_api_db;

CREATE DATABASE sistema_de_gerenciamento_de_despesas_api_db;
\echo ' '
\echo '--- Conectando com sistema_de_gerenciamento_de_despesas_api_db... ---'

-- Conectando ao banco de dados recém-criado
\connect sistema_de_gerenciamento_de_despesas_api_db;

\echo '******** BANCO CONECTADO ********'
\echo ' '
\echo '       Criando as Tabelas...     '
-- Tabela de usuários
CREATE TABLE IF NOT EXISTS usuarios (
  id           SERIAL       PRIMARY KEY,
  nome         VARCHAR(255) NOT NULL,
  email        VARCHAR(255) NOT NULL UNIQUE,
  senha_hash   VARCHAR(255) NOT NULL,
  dataCriacao  TIMESTAMP    NOT NULL DEFAULT now()
);

-- Tabela de categorias
CREATE TABLE IF NOT EXISTS categoria (
  id          SERIAL       PRIMARY KEY,
  nome        VARCHAR(255) NOT NULL,
  descricao   VARCHAR(255)
);

-- Tabela de despesas
CREATE TABLE IF NOT EXISTS despesa (
  id           SERIAL       PRIMARY KEY,
  usuario_id   INT NOT NULL REFERENCES Usuarios,
  categoria_id INT NOT NULL REFERENCES Categoria,
  titulo       VARCHAR(255) NOT NULL,
  valor        MONEY NOT NULL,
  data         DATE NOT NULL,
  dataCriacao  TIMESTAMP    NOT NULL DEFAULT now()
);
\echo ' '
\echo '--- Tabelas criadas, inserindo dados... ---'

-- Inserindo valores de exemplo na tabela Usuarios
INSERT INTO usuarios (nome, email, senha_hash) VALUES
('João Silva', 'joao.silva@example.com', 'hash_senha_joao_123'),
('Maria Oliveira', 'maria.oliveria@example.com', 'hash_senha_maria_456'),
('Pedro Souza', 'pedro.souza@example.com', 'hash_senha_pedro_789');

-- Inserindo valores de exemplo na tabela Categoria
INSERT INTO categoria (nome, descricao) VALUES
('Alimentação', 'Despesas com comida, restaurantes e supermercados.'),
('Transporte', 'Gastos com combustíveis, passagens e manutenção do veículo.'),
('Moradia', 'Aluguel, contas de luz, água e internet.'),
('Lazer', 'Entretenimento, viagens e hobbies.'),
('Saúde', 'Consultas médicas, medicamentos e planos de saúde.');

-- Inserindo valores de exemplo na tabela Despesa
-- Os IDs de usuarios e categorias são referenciados para garantir a integridade dos dados
INSERT INTO despesa (usuario_id, categoria_id, titulo, valor, data) VALUES
-- Despesas do João Silva (usuario_id = 1)
(1, 1, 'Supermercado Mensal', 'R$ 550.00', '2023-10-05'),
(1, 2, 'Combustível', 'R$ 120.50', '2023-10-10'),
(1, 4, 'Cinema com amigos', 'R$ 80.00', '2023-10-15'),

-- Despesas da Maria Oliveira (usuario_id = 2)
(2, 3, 'Aluguel', 'R$ 1500.00', '2023-10-01'),
(2, 5, 'Remédio da farmácia', 'R$ 45.75', '2023-10-08'),
(2, 1, 'Jantar fora', 'R$ 95.20', '2023-10-12'),

-- Despesas do Pedro Souza (usuario_id = 3)
(3, 2, 'Bilhete de metrô', 'R$ 4.40', '2023-10-02'),
(3, 4, 'Viagem de final de semana', 'R$ 350.00', '2023-10-20'),
(3, 3, 'Conta de energia', 'R$ 180.00', '2023-10-25');

\echo '@@@@@@@ DADOS INSERIDOS COM SUCESSO @@@@@@@'
\echo ' '
