import { Router } from 'express';
import authRoutes from './auth.routes';
import protectedRoutes from './protected.routes';
import debugRoutes from './debug.routes';

const router = Router();

router.use(authRoutes);
router.use(protectedRoutes);

// Endpoint de debug habilitado apenas fora de produção
if (process.env.NODE_ENV !== 'production') {
  router.use(debugRoutes);
}

export default router;
