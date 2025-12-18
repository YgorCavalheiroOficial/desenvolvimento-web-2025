import { Router } from "express";
import { pool } from "../database/db.js";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const router = Router();

router.post("/login", async (req, res) => {
    const { email, senha } = req.body;

    try {
        const { rows } = await pool.query("SELECT id, nome, email, senha_hash, role FROM usuarios WHERE email = $1", [email]);
        const user = rows[0];

        if (!user) {
            return res.status(400).json({ erro: "E-mail ou senha inválidos." });
        }

        const isMatch = await bcrypt.compare(senha, user.senha_hash);
        
        if (!isMatch) {
            return res.status(400).json({ erro: "E-mail ou senha inválidos." });
        }
        
        // Gerar JWT com o ID, ROLE e nome
        const token = jwt.sign(
            { id: user.id, role: user.role, nome: user.nome }, 
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        // Retornar token e dados do usuário
        return res.json({ 
            token, 
            user: { id: user.id, nome: user.nome, email: user.email, role: user.role } 
        });

    } catch (erro) {
        console.error(erro);
        res.status(500).json({ erro: "Erro interno no processo de login" });
    }
});

export default router;