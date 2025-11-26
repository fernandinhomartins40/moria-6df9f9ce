# Correções Rápidas Necessárias

Execute os seguintes comandos para corrigir os erros de TypeScript:

## 1. Adicionar export no auth.middleware.ts
```typescript
// No final do arquivo auth.middleware.ts, adicione:
export const authenticateCustomer = AuthMiddleware.authenticate;
```

## 2. Criar arquivo async-handler.util.ts (se não existir)
```typescript
// apps/backend/src/shared/utils/async-handler.util.ts
import { Request, Response, NextFunction } from 'express';

export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
```

## 3. Criar arquivo validation.util.ts (se não existir)
```typescript
// apps/backend/src/shared/utils/validation.util.ts
import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { ApiError } from './error.util.js';

export async function validateDto<T>(dtoClass: new () => T, plain: any): Promise<T> {
  const dtoObject = plainToClass(dtoClass, plain);
  const errors = await validate(dtoObject as any);

  if (errors.length > 0) {
    const messages = errors.map(error =>
      Object.values(error.constraints || {}).join(', ')
    ).join('; ');
    throw ApiError.badRequest(`Validation failed: ${messages}`);
  }

  return dtoObject;
}
```

## 4. Estender tipo Request no support.controller.ts
```typescript
// No topo do arquivo support.controller.ts, adicione:
declare global {
  namespace Express {
    interface Request {
      customer?: {
        id: string;
        email: string;
        name: string;
        status: string;
        level: string;
      };
    }
  }
}
```

## 5. Corrigir faq.controller.ts - adicionar return
No método searchFAQ, linha 24, adicione return:
```typescript
if (!q || typeof q !== 'string') {
  return res.status(400).json({  // <-- Adicione return aqui
    success: false,
    error: 'Parâmetro de busca (q) é obrigatório',
  });
}
```

## 6. Instalar dependências faltantes (se necessário)
```bash
cd apps/backend
npm install class-validator class-transformer
```

## Comando Rápido (Execute todos de uma vez)
```bash
cd "c:\Projetos Cursor\moria-6df9f9ce\apps\backend"

# Adicionar export
echo "export const authenticateCustomer = AuthMiddleware.authenticate;" >> src/middlewares/auth.middleware.ts

# Criar async-handler
cat > src/shared/utils/async-handler.util.ts << 'EOF'
import { Request, Response, NextFunction } from 'express';
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
EOF

# Criar validation
cat > src/shared/utils/validation.util.ts << 'EOF'
import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { ApiError } from './error.util.js';
export async function validateDto<T>(dtoClass: new () => T, plain: any): Promise<T> {
  const dtoObject = plainToClass(dtoClass, plain);
  const errors = await validate(dtoObject as any);
  if (errors.length > 0) {
    const messages = errors.map(error => Object.values(error.constraints || {}).join(', ')).join('; ');
    throw ApiError.badRequest(\`Validation failed: \${messages}\`);
  }
  return dtoObject;
}
EOF

# Instalar dependências
npm install class-validator class-transformer
```
