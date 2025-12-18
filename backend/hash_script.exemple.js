//Script para gerar o hash da senha para o primeiro usuário admin,
//Essa hash deve ser utilizado no script do banco de dados, no campo da senha do usuário admin.

import bcrypt from 'bcrypt';

const senhaEmTextoPuro = 'senha_para_fazer_o_hash'; 
const saltRounds = 10; 

// Função para gerar o hash
async function gerarHash() {
    try {
        const hash = await bcrypt.hash(senhaEmTextoPuro, saltRounds);
        console.log("--- COPIE O HASH ABAIXO ---");
        console.log(hash);
        console.log("---------------------------");
    } catch (error) {
        console.error("Erro ao gerar hash:", error);
    }
}

gerarHash();