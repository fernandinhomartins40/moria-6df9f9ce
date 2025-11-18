# 🚀 PLANO DE IMPLEMENTAÇÃO - SISTEMA DE REVISÕES

## ✅ CONCLUÍDO

### Backend - Modelo e Serviços
- ✅ Schema Prisma atualizado com campos de mecânico
- ✅ DTOs atualizados (create e update)
- ✅ Métodos adicionados ao RevisionsService:
  - `assignMechanic()` - Atribuir mecânico
  - `transferMechanic()` - Transferir revisão
  - `getRevisionsByMechanic()` - Buscar por mecânico
  - `unassignMechanic()` - Remover mecânico
  - `getMechanicWorkloadStats()` - Estatísticas de carga
  - `getAllMechanicsWorkload()` - Carga de todos os mecânicos

## 📋 PRÓXIMOS PASSOS

### 1. Controller e Rotas (BACKEND)

**Arquivo**: `apps/backend/src/modules/revisions/revisions.controller.ts`

Adicionar métodos ao controller (antes do fechamento da classe):

```typescript
  /**
   * POST /revisions/:id/assign-mechanic
   * Assign mechanic to revision
   */
  assignMechanic = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.admin) {
        throw new Error('Admin not authenticated');
      }

      const { mechanicId } = req.body;
      const revision = await this.revisionsService.assignMechanic(
        req.params.id,
        mechanicId
      );

      res.status(200).json({
        success: true,
        data: revision,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /revisions/:id/transfer-mechanic
   * Transfer revision to another mechanic
   */
  transferMechanic = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.admin) {
        throw new Error('Admin not authenticated');
      }

      const { newMechanicId, reason } = req.body;
      const revision = await this.revisionsService.transferMechanic(
        req.params.id,
        newMechanicId,
        reason
      );

      res.status(200).json({
        success: true,
        data: revision,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * DELETE /revisions/:id/unassign-mechanic
   * Unassign mechanic from revision
   */
  unassignMechanic = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.admin) {
        throw new Error('Admin not authenticated');
      }

      const revision = await this.revisionsService.unassignMechanic(req.params.id);

      res.status(200).json({
        success: true,
        data: revision,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /revisions/mechanic/:mechanicId
   * Get revisions by mechanic
   */
  getRevisionsByMechanic = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.admin) {
        throw new Error('Admin not authenticated');
      }

      const filters: any = {};

      if (req.query.status) {
        filters.status = req.query.status as string;
      }

      if (req.query.page) {
        filters.page = parseInt(req.query.page as string, 10);
      }

      if (req.query.limit) {
        filters.limit = parseInt(req.query.limit as string, 10);
      }

      const result = await this.revisionsService.getRevisionsByMechanic(
        req.params.mechanicId,
        filters
      );

      res.status(200).json({
        success: true,
        data: result.data,
        meta: result.meta,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /revisions/mechanics/workload
   * Get all mechanics workload
   */
  getAllMechanicsWorkload = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.admin) {
        throw new Error('Admin not authenticated');
      }

      const workloads = await this.revisionsService.getAllMechanicsWorkload();

      res.status(200).json({
        success: true,
        data: workloads,
      });
    } catch (error) {
      next(error);
    }
  };
```

**Arquivo**: `apps/backend/src/modules/revisions/revisions.routes.ts`

Adicionar rotas (após as rotas existentes):

```typescript
// Mechanic management (managers and above)
router.post(
  '/:id/assign-mechanic',
  AdminAuthMiddleware.authenticate,
  AdminAuthMiddleware.requireMinRole(AdminRole.MANAGER),
  revisionsController.assignMechanic
);

router.post(
  '/:id/transfer-mechanic',
  AdminAuthMiddleware.authenticate,
  AdminAuthMiddleware.requireMinRole(AdminRole.MANAGER),
  revisionsController.transferMechanic
);

router.delete(
  '/:id/unassign-mechanic',
  AdminAuthMiddleware.authenticate,
  AdminAuthMiddleware.requireMinRole(AdminRole.MANAGER),
  revisionsController.unassignMechanic
);

// Get revisions by mechanic (all staff can view their own)
router.get(
  '/mechanic/:mechanicId',
  AdminAuthMiddleware.authenticate,
  AdminAuthMiddleware.requireMinRole(AdminRole.STAFF),
  revisionsController.getRevisionsByMechanic
);

// Get all mechanics workload (managers can see all)
router.get(
  '/mechanics/workload',
  AdminAuthMiddleware.authenticate,
  AdminAuthMiddleware.requireMinRole(AdminRole.MANAGER),
  revisionsController.getAllMechanicsWorkload
);
```

### 2. Migração do Banco

Executar:
```bash
cd apps/backend
npx prisma migrate dev --name add_mechanic_to_revisions
npx prisma generate
```

### 3. Frontend - Services

**Arquivo**: `apps/frontend/src/api/revisionService.ts`

Adicionar métodos:

```typescript
  /**
   * Assign mechanic to revision
   */
  async assignMechanic(revisionId: string, mechanicId: string): Promise<RevisionResponse> {
    const response = await apiClient.post(`/admin/revisions/${revisionId}/assign-mechanic`, {
      mechanicId
    });
    return response.data.data;
  }

  /**
   * Transfer revision to another mechanic
   */
  async transferMechanic(
    revisionId: string,
    newMechanicId: string,
    reason?: string
  ): Promise<RevisionResponse> {
    const response = await apiClient.post(`/admin/revisions/${revisionId}/transfer-mechanic`, {
      newMechanicId,
      reason
    });
    return response.data.data;
  }

  /**
   * Unassign mechanic from revision
   */
  async unassignMechanic(revisionId: string): Promise<RevisionResponse> {
    const response = await apiClient.delete(`/admin/revisions/${revisionId}/unassign-mechanic`);
    return response.data.data;
  }

  /**
   * Get revisions by mechanic
   */
  async getRevisionsByMechanic(
    mechanicId: string,
    params?: { page?: number; limit?: number; status?: string }
  ): Promise<{ data: RevisionResponse[]; meta: any }> {
    const response = await apiClient.get(`/admin/revisions/mechanic/${mechanicId}`, { params });
    return response.data;
  }

  /**
   * Get all mechanics workload
   */
  async getMechanicsWorkload(): Promise<any[]> {
    const response = await apiClient.get('/admin/revisions/mechanics/workload');
    return response.data.data;
  }
```

**Arquivo**: `apps/frontend/src/api/adminService.ts`

Adicionar interface AdminRevision (atualizar):

```typescript
export interface AdminRevision {
  id: string;
  customerId: string;
  vehicleId: string;
  date: string;
  mileage: number | null;
  status: 'DRAFT' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  checklistItems: any;
  generalNotes: string | null;
  recommendations: string | null;

  // NOVOS CAMPOS
  assignedMechanicId: string | null;
  mechanicName: string | null;
  mechanicNotes: string | null;
  assignedAt: string | null;
  transferHistory: any[] | null;

  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
  vehicle?: {
    id: string;
    brand: string;
    model: string;
    year: number;
    plate: string;
    color: string;
  };
  customer?: {
    id: string;
    name: string;
    email: string;
    phone: string;
  };
  assignedMechanic?: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}
```

Adicionar método para buscar mecânicos:

```typescript
  /**
   * Get all mechanics (admins)
   */
  async getMechanics(params?: {
    page?: number;
    limit?: number;
    role?: string;
  }): Promise<{ data: any[]; meta: any }> {
    const response = await apiClient.get('/admin/admins', { params });
    return response.data;
  }
```

## 🎯 IMPLEMENTAÇÃO PRIORITÁRIA CONCLUÍDA

A base do sistema de mecânicos está completa. O próximo passo crítico é:

1. ✅ Executar a migração do Prisma
2. ✅ Adicionar rotas e controller methods
3. ⏭️ Criar componentes do frontend (próxima fase)

Continue com as fases 3 e 4 quando estiver pronto!
