import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
// Importe as rotas
import authRoutes from './routes/auth.routes.js';
import despesasRoutes from './routes/despesas.routes.js';
import categoriasRoutes from './routes/categorias_despesa.routes.js';
import usuariosRoutes from './routes/usuarios.routes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors({
    origin: 'http://localhost:5173' // Permite acesso apenas do seu frontend Vite
}));
app.use(express.json());

// Rotas da API
app.use('/api/auth', authRoutes); // Rota de Login
app.use('/api/despesas', despesasRoutes);
app.use('/api/categorias_despesa', categoriasRoutes);
app.use('/api/usuarios', usuariosRoutes);

// Rota de Teste Simples
app.get('/api/status', (req, res) => {
    res.json({ message: 'Backend rodando perfeitamente!' });
});

app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
});