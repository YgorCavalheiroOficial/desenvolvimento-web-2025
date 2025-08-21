# 💰 Sistema de Controle de Despesas  

## 1) Problema  
Muitas pessoas têm dificuldade em organizar e acompanhar suas despesas pessoais. Anotações em papel ou planilhas acabam ficando desatualizadas ou pouco práticas. Isso gera falta de controle financeiro, gastos desnecessários e dificuldade para alcançar metas pessoais.  

O foco inicial será em **usuários individuais** que desejam acompanhar seus gastos de forma simples e acessível, com objetivo de **organizar despesas e visualizar relatórios financeiros básicos**.  

---

## 2) Atores e Decisores (quem usa / quem decide)  
**Usuários principais:** Pessoas físicas que querem registrar e acompanhar suas despesas pessoais.  
**Decisores/Apoiadores:** Professores (validação acadêmica), comunidade usuária (feedback).  

---

## 3) Casos de uso (de forma simples)  
**Todos:** Criar conta, logar/deslogar, editar perfil.  

**Usuário:**  
- Manter (inserir, listar, editar, remover) categorias de despesa  
- Manter (inserir, listar, editar, remover) despesas  
- Visualizar resumo mensal e gráfico de despesas por categoria  
- Exportar despesas para CSV  

---

## 4) Limites e suposições  
- **Limites:** entrega final até o término da disciplina; rodar no navegador; tecnologias livres (sem serviços pagos).  
- **Suposições:** acesso à internet, navegador atualizado, GitHub disponível, tempo para testes em sala.  
- **Plano B:** se não houver internet, rodar localmente; se não houver tempo para validação com muitos usuários, testar com colegas do grupo.  

---

## 5) Hipóteses + validação  
- **H-Valor:** Se o usuário conseguir cadastrar e visualizar suas despesas organizadas por categoria, então terá maior clareza sobre seus gastos mensais.  
  - **Validação (valor):** teste com 5 usuários; meta: pelo menos 4 conseguirem cadastrar e consultar despesas sem ajuda.  

- **H-Viabilidade:** Com HTML/CSS/JS + backend em Node.js, o cadastro e a listagem de despesas deve ocorrer em até 1 segundo em 9 de 10 casos.  
  - **Validação (viabilidade):** medir em protótipo com 30 operações; meta: ≥27 concluídas em ≤1s.  

---

## 6) Fluxo principal e primeira fatia  
**Fluxo principal (curto):**  
1) Usuário faz login  
2) Informa despesa  
3) Sistema salva no banco  
4) Exibe lista atualizada  

**Primeira fatia vertical (escopo mínimo):**  
- Incluir tela de login  
- Cadastro de uma despesa simples (título e valor)  
- Exibir lista de despesas  

**Critérios de aceite:**  
- Após salvar despesa, ela aparece na lista  
- Despesa pode ser excluída  

---

## 7) Esboços de algumas telas (wireframes)  
- Tela de Login  
- Tela de Cadastro de Despesa  
- Tela de Lista com resumo mensal  

*Demonstação(TODO)  

---

## 8) Tecnologias  

### 8.1 Navegador  
**Navegador:** HTML5, CSS3, JavaScript, Bootstrap, Chart.js  
**Armazenamento local (se usar):** LocalStorage  
**Hospedagem:** GitHub Pages  

### 8.2 Front-end (servidor de aplicação, se existir)  
**Front-end (servidor):** Node.js + Express  
**Hospedagem:** Railway/Render (Ainda não definido)  

### 8.3 Back-end (API/servidor, se existir)  
**Back-end (API):** Node.js + Express  
**Banco de dados:** PostgreSQL  
**Deploy do back-end:** Railway/Render  

---

## 9) Plano de Dados (Dia 0)  

### 9.1 Entidades  
- **Usuário** — representa quem acessa o sistema  
- **Categoria** — classificação das despesas (ex.: alimentação, transporte)  
- **Despesa** — gasto registrado pelo usuário  

### 9.2 Campos por entidade  

**Usuário**  
| Campo         | Tipo        | Obrigatório | Exemplo              |  
|---------------|------------|-------------|----------------------|  
| id            | número     | sim         | 1                    |  
| nome          | texto      | sim         | "Ygor"    |  
| email         | texto único| sim         | "ygor@email.com"     |  
| senha_hash    | texto      | sim         | "$2a$10$..."         |  
| dataCriacao   | data/hora  | sim         | 2025-08-20 14:30     |  

**Categoria**  
| Campo      | Tipo   | Obrigatório | Exemplo                       |  
|------------|--------|-------------|-------------------------------|  
| id         | número | sim         | 1                             |  
| nome       | texto  | sim         | "Alimentação"                 |  
| descricao  | texto  | não         | "Gastos com comida e mercado" |  

**Despesa**  
| Campo        | Tipo        | Obrigatório | Exemplo             |  
|--------------|-------------|-------------|---------------------|  
| id           | número      | sim         | 1                   |  
| usuario_id   | número (fk) | sim         | 1                   |  
| categoria_id | número (fk) | sim         | 2                   |  
| titulo       | texto       | sim         | "Supermercado"      |  
| valor        | número      | sim         | 200.00              |  
| data         | data        | sim         | 2025-08-15          |  
| dataCriacao  | data/hora   | sim         | 2025-08-15 10:00    |  

### 9.3 Relações  
- Um **Usuário** tem muitas **Categorias** (1→N)  
- Um **Usuário** tem muitas **Despesas** (1→N)  
- Uma **Despesa** pertence a uma **Categoria** (N→1)  