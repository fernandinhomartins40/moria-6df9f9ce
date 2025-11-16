import { Router } from 'express';
import { UploadsController } from './uploads.controller.js';
import { AdminAuthMiddleware } from '@middlewares/admin-auth.middleware.js';
import { AdminRole } from '@prisma/client';

const router = Router();
const uploadsController = new UploadsController();

// Protected routes (admin/manager only)
router.post(
  '/images',
  AdminAuthMiddleware.authenticate,
  AdminAuthMiddleware.requireMinRole(AdminRole.MANAGER),
  uploadsController.uploadImages
);

router.delete(
  '/images',
  AdminAuthMiddleware.authenticate,
  AdminAuthMiddleware.requireMinRole(AdminRole.MANAGER),
  uploadsController.deleteImages
);

export default router;
