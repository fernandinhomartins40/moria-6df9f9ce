import { Revision, RevisionStatus } from '@prisma/client';
import { prisma } from '@config/database.js';
import { ApiError } from '@shared/utils/error.util.js';
import { CreateRevisionDto } from './dto/create-revision.dto.js';
import { UpdateRevisionDto } from './dto/update-revision.dto.js';
import { PaginationUtil, PaginatedResponse } from '@shared/utils/pagination.util.js';
import { logger } from '@shared/utils/logger.util.js';

export interface RevisionFilters {
  customerId?: string;
  vehicleId?: string;
  status?: RevisionStatus;
  dateFrom?: Date;
  dateTo?: Date;
  page?: number;
  limit?: number;
  sortBy?: 'date' | 'status' | 'mileage' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

export class RevisionsService {
  /**
   * Get all revisions (Admin) - without customer filter unless specified
   */
  async getAllRevisions(
    filters: RevisionFilters = {}
  ): Promise<PaginatedResponse<Revision>> {
    const { page, limit } = PaginationUtil.validateParams({
      page: filters.page,
      limit: filters.limit,
    });

    const where: any = {};

    if (filters.customerId) {
      where.customerId = filters.customerId;
    }

    if (filters.vehicleId) {
      where.vehicleId = filters.vehicleId;
    }

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.dateFrom || filters.dateTo) {
      where.date = {};
      if (filters.dateFrom) {
        where.date.gte = filters.dateFrom;
      }
      if (filters.dateTo) {
        where.date.lte = filters.dateTo;
      }
    }

    // Determinar ordenação
    const sortBy = filters.sortBy || 'date';
    const sortOrder = filters.sortOrder || 'desc';
    const orderBy: any = {};
    orderBy[sortBy] = sortOrder;

    const [revisions, totalCount] = await Promise.all([
      prisma.revision.findMany({
        where,
        skip: PaginationUtil.calculateSkip(page, limit),
        take: limit,
        orderBy,
        include: {
          vehicle: {
            select: {
              id: true,
              brand: true,
              model: true,
              year: true,
              plate: true,
              color: true,
            },
          },
          customer: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
            },
          },
        },
      }),
      prisma.revision.count({ where }),
    ]);

    return PaginationUtil.buildResponse(revisions, page, limit, totalCount);
  }

  /**
   * Get all revisions for a customer with filters
   */
  async getRevisions(
    customerId: string,
    filters: RevisionFilters = {}
  ): Promise<PaginatedResponse<Revision>> {
    const { page, limit } = PaginationUtil.validateParams({
      page: filters.page,
      limit: filters.limit,
    });

    const where: any = { customerId };

    if (filters.vehicleId) {
      where.vehicleId = filters.vehicleId;
    }

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.dateFrom || filters.dateTo) {
      where.date = {};
      if (filters.dateFrom) {
        where.date.gte = filters.dateFrom;
      }
      if (filters.dateTo) {
        where.date.lte = filters.dateTo;
      }
    }

    const [revisions, totalCount] = await Promise.all([
      prisma.revision.findMany({
        where,
        skip: PaginationUtil.calculateSkip(page, limit),
        take: limit,
        orderBy: { date: 'desc' },
        include: {
          vehicle: {
            select: {
              id: true,
              brand: true,
              model: true,
              year: true,
              plate: true,
            },
          },
        },
      }),
      prisma.revision.count({ where }),
    ]);

    return PaginationUtil.buildResponse(revisions, page, limit, totalCount);
  }

  /**
   * Get revision by ID
   */
  async getRevisionById(id: string, customerId: string): Promise<Revision> {
    const revision = await prisma.revision.findFirst({
      where: { id, customerId },
      include: {
        vehicle: {
          select: {
            id: true,
            brand: true,
            model: true,
            year: true,
            plate: true,
            color: true,
            chassisNumber: true,
            mileage: true,
          },
        },
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
      },
    });

    if (!revision) {
      throw ApiError.notFound('Revision not found');
    }

    return revision;
  }

  /**
   * Create new revision
   */
  async createRevision(
    customerId: string,
    dto: CreateRevisionDto
  ): Promise<Revision> {
    // Verify vehicle exists and belongs to customer
    const vehicle = await prisma.customerVehicle.findFirst({
      where: {
        id: dto.vehicleId,
        customerId,
      },
    });

    if (!vehicle) {
      throw ApiError.notFound('Vehicle not found');
    }

    const revision = await prisma.revision.create({
      data: {
        customerId,
        vehicleId: dto.vehicleId,
        date: new Date(dto.date),
        mileage: dto.mileage,
        status: RevisionStatus.DRAFT,
        checklistItems: dto.checklistItems,
        generalNotes: dto.generalNotes,
        recommendations: dto.recommendations,
      },
    });

    logger.info(`Revision created: ${revision.id} for vehicle ${dto.vehicleId}`);

    return revision;
  }

  /**
   * Update revision
   */
  async updateRevision(
    id: string,
    customerId: string,
    dto: UpdateRevisionDto
  ): Promise<Revision> {
    // Verify revision exists and belongs to customer
    const existingRevision = await this.getRevisionById(id, customerId);

    // Prevent updates to completed or cancelled revisions
    if (
      existingRevision.status === RevisionStatus.COMPLETED ||
      existingRevision.status === RevisionStatus.CANCELLED
    ) {
      throw ApiError.badRequest(
        `Cannot update revision with status ${existingRevision.status}`
      );
    }

    const updateData: any = {};

    if (dto.date) {
      updateData.date = new Date(dto.date);
    }

    if (dto.mileage !== undefined) {
      updateData.mileage = dto.mileage;
    }

    if (dto.status) {
      updateData.status = dto.status;

      // Set completedAt when status changes to COMPLETED
      if (dto.status === RevisionStatus.COMPLETED) {
        updateData.completedAt = new Date();
      }
    }

    if (dto.checklistItems) {
      updateData.checklistItems = dto.checklistItems;
    }

    if (dto.generalNotes !== undefined) {
      updateData.generalNotes = dto.generalNotes;
    }

    if (dto.recommendations !== undefined) {
      updateData.recommendations = dto.recommendations;
    }

    const revision = await prisma.revision.update({
      where: { id },
      data: updateData,
    });

    logger.info(`Revision updated: ${revision.id}`);

    return revision;
  }

  /**
   * Delete revision
   */
  async deleteRevision(id: string, customerId: string): Promise<void> {
    // Verify revision exists and belongs to customer
    const revision = await this.getRevisionById(id, customerId);

    // Prevent deletion of completed revisions
    if (revision.status === RevisionStatus.COMPLETED) {
      throw ApiError.badRequest('Cannot delete completed revision');
    }

    await prisma.revision.delete({
      where: { id },
    });

    logger.info(`Revision deleted: ${id}`);
  }

  /**
   * Start revision (change status to IN_PROGRESS)
   */
  async startRevision(id: string, customerId: string): Promise<Revision> {
    const revision = await this.getRevisionById(id, customerId);

    if (revision.status !== RevisionStatus.DRAFT) {
      throw ApiError.badRequest('Only draft revisions can be started');
    }

    return prisma.revision.update({
      where: { id },
      data: { status: RevisionStatus.IN_PROGRESS },
    });
  }

  /**
   * Complete revision
   */
  async completeRevision(id: string, customerId: string): Promise<Revision> {
    const revision = await this.getRevisionById(id, customerId);

    if (revision.status === RevisionStatus.COMPLETED) {
      throw ApiError.badRequest('Revision is already completed');
    }

    if (revision.status === RevisionStatus.CANCELLED) {
      throw ApiError.badRequest('Cannot complete cancelled revision');
    }

    // Update vehicle mileage if revision has mileage
    if (revision.mileage) {
      await prisma.customerVehicle.update({
        where: { id: revision.vehicleId },
        data: { mileage: revision.mileage },
      });
    }

    return prisma.revision.update({
      where: { id },
      data: {
        status: RevisionStatus.COMPLETED,
        completedAt: new Date(),
      },
    });
  }

  /**
   * Cancel revision
   */
  async cancelRevision(id: string, customerId: string): Promise<Revision> {
    const revision = await this.getRevisionById(id, customerId);

    if (revision.status === RevisionStatus.COMPLETED) {
      throw ApiError.badRequest('Cannot cancel completed revision');
    }

    if (revision.status === RevisionStatus.CANCELLED) {
      throw ApiError.badRequest('Revision is already cancelled');
    }

    return prisma.revision.update({
      where: { id },
      data: { status: RevisionStatus.CANCELLED },
    });
  }

  /**
   * Get revision statistics for a customer
   */
  async getRevisionStatistics(customerId: string): Promise<{
    total: number;
    byStatus: Record<RevisionStatus, number>;
    byVehicle: Array<{ vehicleId: string; vehicleName: string; count: number }>;
  }> {
    const [total, byStatus, byVehicle] = await Promise.all([
      prisma.revision.count({ where: { customerId } }),
      prisma.revision.groupBy({
        by: ['status'],
        where: { customerId },
        _count: true,
      }),
      prisma.revision.groupBy({
        by: ['vehicleId'],
        where: { customerId },
        _count: true,
      }),
    ]);

    // Get vehicle details
    const vehicleIds = byVehicle.map(v => v.vehicleId);
    const vehicles = await prisma.customerVehicle.findMany({
      where: { id: { in: vehicleIds } },
      select: { id: true, brand: true, model: true, year: true, plate: true },
    });

    const vehicleMap = new Map(vehicles.map(v => [v.id, v]));

    return {
      total,
      byStatus: byStatus.reduce(
        (acc, item) => {
          acc[item.status] = item._count;
          return acc;
        },
        {} as Record<RevisionStatus, number>
      ),
      byVehicle: byVehicle.map(item => {
        const vehicle = vehicleMap.get(item.vehicleId);
        return {
          vehicleId: item.vehicleId,
          vehicleName: vehicle
            ? `${vehicle.brand} ${vehicle.model} ${vehicle.year} (${vehicle.plate})`
            : 'Unknown Vehicle',
          count: item._count,
        };
      }),
    };
  }

  /**
   * Get revision history for a vehicle
   */
  async getVehicleRevisionHistory(
    vehicleId: string,
    customerId: string
  ): Promise<Revision[]> {
    // Verify vehicle belongs to customer
    const vehicle = await prisma.customerVehicle.findFirst({
      where: { id: vehicleId, customerId },
    });

    if (!vehicle) {
      throw ApiError.notFound('Vehicle not found');
    }

    return prisma.revision.findMany({
      where: { vehicleId },
      orderBy: { date: 'desc' },
    });
  }

  // ==================== ADMIN METHODS ====================

  /**
   * Get revision by ID (Admin - no customer check)
   */
  async getRevisionByIdAdmin(id: string): Promise<Revision> {
    const revision = await prisma.revision.findUnique({
      where: { id },
      include: {
        vehicle: true,
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
      },
    });

    if (!revision) {
      throw ApiError.notFound('Revision not found');
    }

    return revision;
  }

  /**
   * Update revision (Admin - no customer check)
   */
  async updateRevisionAdmin(
    id: string,
    dto: UpdateRevisionDto
  ): Promise<Revision> {
    const revision = await prisma.revision.findUnique({
      where: { id },
    });

    if (!revision) {
      throw ApiError.notFound('Revision not found');
    }

    return prisma.revision.update({
      where: { id },
      data: {
        ...(dto.mileage !== undefined && { mileage: dto.mileage }),
        ...(dto.status && { status: dto.status }),
        ...(dto.checklistItems && { checklistItems: dto.checklistItems }),
        ...(dto.generalNotes !== undefined && { generalNotes: dto.generalNotes }),
        ...(dto.recommendations !== undefined && {
          recommendations: dto.recommendations,
        }),
        ...(dto.mechanicName !== undefined && { mechanicName: dto.mechanicName }),
        ...(dto.mechanicNotes !== undefined && { mechanicNotes: dto.mechanicNotes }),
        updatedAt: new Date(),
      },
    });
  }

  /**
   * Update revision checklist partially (Admin)
   * Permite salvar progresso parcial do checklist
   */
  async updateRevisionChecklistPartial(
    id: string,
    checklistItems: any[]
  ): Promise<Revision> {
    const revision = await prisma.revision.findUnique({
      where: { id },
    });

    if (!revision) {
      throw ApiError.notFound('Revision not found');
    }

    // Permite atualizar mesmo se a revisão estiver completada
    // para casos de correção/adição de informações
    return prisma.revision.update({
      where: { id },
      data: {
        checklistItems,
        updatedAt: new Date(),
      },
    });
  }

  /**
   * Assign mechanic to revision (Admin)
   */
  async assignMechanicToRevision(
    id: string,
    mechanicName: string,
    assignedBy: string
  ): Promise<Revision> {
    const revision = await prisma.revision.findUnique({
      where: { id },
    });

    if (!revision) {
      throw ApiError.notFound('Revision not found');
    }

    return prisma.revision.update({
      where: { id },
      data: {
        mechanicName,
        assignedBy,
        assignedAt: new Date(),
        // Automaticamente move para IN_PROGRESS se estava em DRAFT
        ...(revision.status === RevisionStatus.DRAFT && {
          status: RevisionStatus.IN_PROGRESS,
        }),
        updatedAt: new Date(),
      },
    });
  }

  /**
   * Transfer revision to another mechanic (Admin)
   */
  async transferRevisionToMechanic(
    id: string,
    newMechanicName: string,
    transferredBy: string,
    transferNotes?: string
  ): Promise<Revision> {
    const revision = await prisma.revision.findUnique({
      where: { id },
    });

    if (!revision) {
      throw ApiError.notFound('Revision not found');
    }

    if (revision.status === RevisionStatus.COMPLETED) {
      throw ApiError.badRequest('Cannot transfer completed revision');
    }

    if (revision.status === RevisionStatus.CANCELLED) {
      throw ApiError.badRequest('Cannot transfer cancelled revision');
    }

    // Adiciona nota de transferência
    const transferNote = `[TRANSFERIDO] De ${revision.mechanicName || 'não atribuído'} para ${newMechanicName} por ${transferredBy}${transferNotes ? `: ${transferNotes}` : ''}`;
    const updatedMechanicNotes = revision.mechanicNotes
      ? `${revision.mechanicNotes}\n\n${transferNote}`
      : transferNote;

    return prisma.revision.update({
      where: { id },
      data: {
        mechanicName: newMechanicName,
        mechanicNotes: updatedMechanicNotes,
        assignedBy: transferredBy,
        assignedAt: new Date(),
        updatedAt: new Date(),
      },
    });
  }

  /**
   * Delete revision (Admin - no customer check)
   */
  async deleteRevisionAdmin(id: string): Promise<void> {
    const revision = await prisma.revision.findUnique({
      where: { id },
    });

    if (!revision) {
      throw ApiError.notFound('Revision not found');
    }

    await prisma.revision.delete({
      where: { id },
    });

    logger.info(`Revision deleted by admin: ${id}`);
  }

  /**
   * Start revision (Admin)
   */
  async startRevisionAdmin(id: string): Promise<Revision> {
    const revision = await prisma.revision.findUnique({
      where: { id },
    });

    if (!revision) {
      throw ApiError.notFound('Revision not found');
    }

    if (revision.status !== RevisionStatus.DRAFT) {
      throw ApiError.badRequest('Only draft revisions can be started');
    }

    return prisma.revision.update({
      where: { id },
      data: {
        status: RevisionStatus.IN_PROGRESS,
        updatedAt: new Date(),
      },
    });
  }

  /**
   * Complete revision (Admin)
   */
  async completeRevisionAdmin(id: string): Promise<Revision> {
    const revision = await prisma.revision.findUnique({
      where: { id },
      include: {
        customer: true,
        vehicle: true,
      },
    });

    if (!revision) {
      throw ApiError.notFound('Revision not found');
    }

    if (revision.status === RevisionStatus.COMPLETED) {
      throw ApiError.badRequest('Revision is already completed');
    }

    // Calcular datas de próximas revisões
    const now = new Date();
    const nextRevisionDate = new Date(now);
    nextRevisionDate.setMonth(now.getMonth() + 6); // Próxima revisão em 6 meses

    const nextOilChangeDate = new Date(now);
    nextOilChangeDate.setMonth(now.getMonth() + 3); // Troca de óleo em 3 meses

    // Calcular quilometragem sugerida
    const nextRevisionMileage = revision.mileage ? revision.mileage + 10000 : undefined;
    const nextOilChangeMileage = revision.mileage ? revision.mileage + 5000 : undefined;

    // Extrair serviços realizados e peças trocadas do checklist
    const checklistItems = revision.checklistItems as any[];
    const servicesPerformed: string[] = [];
    const partsReplaced: string[] = [];

    if (Array.isArray(checklistItems)) {
      checklistItems.forEach((item: any) => {
        if (item.status === 'REPLACED' || item.status === 'SERVICED') {
          servicesPerformed.push(item.itemName || item.name);
        }
        if (item.status === 'REPLACED') {
          partsReplaced.push(item.itemName || item.name);
        }
      });
    }

    // Snapshot completo dos dados
    const revisionData = {
      customer: {
        id: revision.customer.id,
        name: revision.customer.name,
        email: revision.customer.email,
        phone: revision.customer.phone,
      },
      vehicle: {
        id: revision.vehicle.id,
        brand: revision.vehicle.brand,
        model: revision.vehicle.model,
        year: revision.vehicle.year,
        plate: revision.vehicle.plate,
        color: revision.vehicle.color,
      },
      revisionDate: revision.date,
      mileage: revision.mileage,
      checklistItems: revision.checklistItems,
      generalNotes: revision.generalNotes,
      recommendations: revision.recommendations,
      completedAt: now,
    };

    // Atualizar quilometragem do veículo
    if (revision.mileage) {
      await prisma.customerVehicle.update({
        where: { id: revision.vehicleId },
        data: { mileage: revision.mileage },
      });
    }

    return prisma.revision.update({
      where: { id },
      data: {
        status: RevisionStatus.COMPLETED,
        completedAt: now,
        updatedAt: now,
        nextRevisionDate,
        nextRevisionMileage,
        oilChangeDate: now,
        oilChangeMileage: revision.mileage,
        nextOilChangeDate,
        nextOilChangeMileage,
        revisionData,
        servicesPerformed,
        partsReplaced,
      },
    });
  }

  /**
   * Cancel revision (Admin)
   */
  async cancelRevisionAdmin(id: string): Promise<Revision> {
    const revision = await prisma.revision.findUnique({
      where: { id },
    });

    if (!revision) {
      throw ApiError.notFound('Revision not found');
    }

    if (revision.status === RevisionStatus.COMPLETED) {
      throw ApiError.badRequest('Cannot cancel completed revision');
    }

    return prisma.revision.update({
      where: { id },
      data: {
        status: RevisionStatus.CANCELLED,
        updatedAt: new Date(),
      },
    });
  }

  /**
   * Get upcoming maintenance reminders for customer
   */
  async getUpcomingReminders(customerId: string) {
    const now = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(now.getDate() + 30);

    // Get all completed revisions for the customer
    const revisions = await prisma.revision.findMany({
      where: {
        customerId,
        status: RevisionStatus.COMPLETED,
        OR: [
          {
            nextRevisionDate: {
              lte: thirtyDaysFromNow,
              gte: now,
            },
          },
          {
            nextOilChangeDate: {
              lte: thirtyDaysFromNow,
              gte: now,
            },
          },
        ],
      },
      include: {
        vehicle: {
          select: {
            id: true,
            brand: true,
            model: true,
            year: true,
            plate: true,
            mileage: true,
          },
        },
      },
      orderBy: {
        nextRevisionDate: 'asc',
      },
    });

    // Build reminders array
    const reminders: any[] = [];

    revisions.forEach((revision) => {
      // Check for upcoming revision
      if (revision.nextRevisionDate && revision.nextRevisionDate >= now) {
        const daysUntil = Math.ceil(
          (revision.nextRevisionDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
        );

        reminders.push({
          type: 'revision',
          vehicle: revision.vehicle,
          dueDate: revision.nextRevisionDate,
          dueMileage: revision.nextRevisionMileage,
          daysUntil,
          lastRevisionDate: revision.completedAt,
          lastRevisionMileage: revision.mileage,
          urgent: daysUntil <= 7,
        });
      }

      // Check for upcoming oil change
      if (revision.nextOilChangeDate && revision.nextOilChangeDate >= now) {
        const daysUntil = Math.ceil(
          (revision.nextOilChangeDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
        );

        reminders.push({
          type: 'oil_change',
          vehicle: revision.vehicle,
          dueDate: revision.nextOilChangeDate,
          dueMileage: revision.nextOilChangeMileage,
          daysUntil,
          lastOilChangeDate: revision.oilChangeDate,
          lastOilChangeMileage: revision.oilChangeMileage,
          urgent: daysUntil <= 7,
        });
      }
    });

    // Sort by urgency and date
    reminders.sort((a, b) => {
      if (a.urgent !== b.urgent) {
        return a.urgent ? -1 : 1;
      }
      return a.daysUntil - b.daysUntil;
    });

    return reminders;
  }

  /**
   * Get all revision statistics (Admin)
   */
  async getAllRevisionStatistics(): Promise<any> {
    const [total, draft, inProgress, completed, cancelled] = await Promise.all([
      prisma.revision.count(),
      prisma.revision.count({ where: { status: RevisionStatus.DRAFT } }),
      prisma.revision.count({ where: { status: RevisionStatus.IN_PROGRESS } }),
      prisma.revision.count({ where: { status: RevisionStatus.COMPLETED } }),
      prisma.revision.count({ where: { status: RevisionStatus.CANCELLED } }),
    ]);

    return {
      total,
      byStatus: {
        draft,
        inProgress,
        completed,
        cancelled,
      },
    };
  }

  /**
   * Get vehicle revision history (Admin - no customer check)
   */
  async getVehicleRevisionHistoryAdmin(vehicleId: string): Promise<Revision[]> {
    const vehicle = await prisma.customerVehicle.findUnique({
      where: { id: vehicleId },
    });

    if (!vehicle) {
      throw ApiError.notFound('Vehicle not found');
    }

    return prisma.revision.findMany({
      where: { vehicleId },
      orderBy: { date: 'desc' },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
      },
    });
  }
}
