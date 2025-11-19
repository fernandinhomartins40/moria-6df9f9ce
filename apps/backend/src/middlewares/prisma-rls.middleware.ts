import { Prisma } from '@prisma/client';
import { prisma } from '@config/database.js';

/**
 * Prisma Middleware para Row-Level Security (RLS)
 * Define variáveis de sessão PostgreSQL para ativar políticas RLS
 * ✅ SECURITY ENHANCEMENT: Database-level access control
 */

let currentAdminId: string | null = null;
let currentAdminRole: string | null = null;

/**
 * Define o contexto do admin atual para RLS
 * Deve ser chamado no middleware de autenticação
 */
export function setRLSContext(adminId: string, adminRole: string) {
  currentAdminId = adminId;
  currentAdminRole = adminRole;
}

/**
 * Limpa o contexto RLS
 */
export function clearRLSContext() {
  currentAdminId = null;
  currentAdminRole = null;
}

/**
 * Middleware Prisma que aplica RLS
 * Executa SET LOCAL antes de cada query
 */
export async function setupPrismaRLS() {
  prisma.$use(async (params: Prisma.MiddlewareParams, next) => {
    // Apenas aplicar RLS para operações na tabela Revision
    if (params.model === 'Revision' && currentAdminId && currentAdminRole) {
      try {
        // Executar SET LOCAL para definir variáveis de sessão
        await prisma.$executeRawUnsafe(
          `SET LOCAL app.current_user_id = '${currentAdminId}'`
        );
        await prisma.$executeRawUnsafe(
          `SET LOCAL app.current_role = '${currentAdminRole}'`
        );
      } catch (error) {
        // Se RLS ainda não está habilitado, continuar normalmente
        console.warn('[RLS] Policies not enabled yet:', error);
      }
    }

    // Executar query original
    const result = await next(params);

    return result;
  });
}

/**
 * Middleware Express para integração com autenticação
 * Usa req.admin para definir contexto RLS
 */
import { Request, Response, NextFunction } from 'express';

export function rlsContextMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (req.admin) {
    setRLSContext(req.admin.adminId, req.admin.role);

    // Limpar contexto após resposta
    res.on('finish', () => {
      clearRLSContext();
    });
  }

  next();
}
