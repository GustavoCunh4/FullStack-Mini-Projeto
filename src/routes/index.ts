import { Router } from 'express';
import authRoutes from './auth.routes';
import protectedRoutes from './protected.routes';

const router = Router();

router.use(authRoutes);
router.use(protectedRoutes);

export default router;
