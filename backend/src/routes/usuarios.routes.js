import { Router } from 'express';
// Importa os middlewares de segurança
import { verifyToken, authorizeRole } from '../middlewares/auth.js'; 
// Importa todas as funções do controller
import { 
    criarUsuario, 
    listarUsuarios, 
    atualizarUsuario, 
    deletarUsuario 
} from '../controllers/usuarios.controller.js';

const router = Router();

// =========================================================================
// Rota POST: Criar Novo Usuário (Requer Autenticação e Perfil de Admin)
// Esta rota é essencial para garantir que as senhas sejam hasheadas.
// Rota: POST /api/usuarios
// =========================================================================
router.post(
    '/', 
    verifyToken,            
    authorizeRole('admin'), 
    criarUsuario            
);


// =========================================================================
// Rota GET: Listar Todos os Usuários (Requer Autenticação e Perfil de Admin)
// Rota: GET /api/usuarios
// =========================================================================
router.get(
    '/', 
    verifyToken, 
    authorizeRole('admin'), 
    listarUsuarios
);


// =========================================================================
// Rotas de Edição e Deleção por ID (Requer Autenticação e Perfil de Admin)
// Rota: PUT /api/usuarios/:id
// Rota: DELETE /api/usuarios/:id
// =========================================================================
router.put(
    '/:id', 
    verifyToken, 
    authorizeRole('admin'), 
    atualizarUsuario
);

router.delete(
    '/:id', 
    verifyToken, 
    authorizeRole('admin'), 
    deletarUsuario
);


export default router;