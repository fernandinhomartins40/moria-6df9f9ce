# Plano de Melhorias – Moria Peças e Serviços

## Objetivos
- Tornar o projeto pronto para produção com segurança, confiabilidade e manutenção simplificada.
- Eliminar inconsistências de ambiente e deploy.
- Melhorar DX, testes e observabilidade.

---

## Roadmap por fases (priorizado)

### Fase 0 – Alinhamento de ambiente e deploy (P0)
- **Escolher estratégia única de deploy**:
  - Opção A: Backend Express serve SPA (único processo).
  - Opção B: Nginx como reverse proxy para Backend Node (dois processos, mesma imagem ou docker-compose/k8s).
- **Padronizar portas/documentação**:
  - Usar `3081` (código atual) ou voltar tudo para `3080`. Atualizar `BACKEND_README.md`, Vite proxy e logs.
- **Limpeza de repositório**:
  - Remover `*.tar.gz`, `backendsrc*` e pastas/resíduos. Adicionar ao `.gitignore` se necessário.
- **Engines Node**:
  - Backend `"node": ">=18"` para alinhar com Vite.

### Fase 1 – Correções críticas de aplicação (P0)
- **Serviço de API (frontend)**:
  - Remover exports nomeados por destruturação ou exportar wrappers estáticos que não dependam de `this`.
  - Recomendação: exportar somente a instância `default` e ajustar docs/exemplos.
- **Roteamento**:
  - Substituir `window.location.href` por `useNavigate` para navegação interna.

### Fase 2 – Segurança (P0/P1)
- **CSP**:
  - Remover `'unsafe-inline'`; adotar nonces/hashes gerados.
- **CORS**:
  - Exigir `ALLOWED_ORIGIN(S)` configurado(s) e falhar se ausente em produção.
- **Rate limiting e Helmet extra**:
  - `express-rate-limit`, `cors` revisado, `hpp`, `xss-clean`/sanitização onde necessário.
- **Autenticação**:
  - JWT simples para rotas protegidas (admin), storage seguro (HttpOnly cookies). Implementar RBAC básico.
- **Variáveis de ambiente**:
  - Adicionar `.env.example` com chaves e padrões mínimos.

### Fase 3 – Validação e estabilidade (P1)
- **Validação de payloads**:
  - Backend com `zod`/`yup`/`joi` para schemas. Padronizar respostas de erro e códigos HTTP.
- **Cliente HTTP**:
  - `AbortController`, timeout, retries exponenciais para requests idempotentes, normalização de erros.
- **Integração com `react-query`**:
  - Definir keys, tempos de cache, invalidation pós-mutations e estados (loading/error) padronizados.

### Fase 4 – Observabilidade e performance (P1/P2)
- **Logs estruturados**:
  - `pino`/`winston` JSON, níveis, correlação (reqId).
- **Métricas/health**:
  - Endpoint `/api/health` expandido (latência, dependências). Expor Prometheus (`/metrics`) se aplicável.
- **Nginx/Estático**:
  - Cache long-term com `immutable` para assets com hash; Brotli; `etag` habilitado.
- **Build**:
  - `analyze` bundles, dividir chunks críticos, revisar lazy-loading onde fizer sentido.

### Fase 5 – Qualidade e automação (P1/P2)
- **Typecheck e Lint**:
  - Script `typecheck` (`tsc --noEmit`). Reativar `no-unused-vars` (como `warn` inicialmente).
- **Testes**:
  - Frontend: unitários (componentes) e integração (páginas críticas). Backend: rotas/controllers. 
  - E2E mínimo com Playwright/Cypress para fluxos chave.
- **CI**:
  - Pipeline: install → lint → typecheck → test → build. Gate de PR.

### Fase 6 – Acessibilidade e UX (P2)
- **A11y**:
  - `aria-label` para botões icônicos, foco visível, contraste. Rodar auditorias (Lighthouse/axe).
- **UX de navegação**:
  - Garantir SPA-first; preservar estado; feedbacks de carregamento uniformes.

### Fase 7 – Dados e persistência (P2/P3)
- **Banco de dados**:
  - Migrar de mocks para Postgres/MySQL. Camada de repositórios, migrações (Prisma/Knex). Seeds de dev.
- **Uploads**:
  - Storage (S3/GCS local/dev). Validação de mime/tamanho. URLs assinadas.

---

## Quick Wins (1–2 dias)
- Alinhar portas e documentação (3081 ou 3080).
- Corrigir export do serviço de API e exemplos de uso.
- Trocar `window.location.href` por `useNavigate`.
- Adicionar `aria-label` nos botões do `Header`.
- Adicionar script `typecheck` e rodar em dev/CI.

---

## Itens detalhados por área

### Segurança
- CSP com nonces/hashes; remover `'unsafe-inline'`.
- `express-rate-limit`, `helmet` reforçado, `hpp`, sanitização.
- CORS estrito com lista de origens; sem fallback genérico.
- Auth JWT com refresh/expiração; cookies HttpOnly + SameSite; logout seguro.

### Infra/Deploy
- Definir padrão: Node serve SPA OU Nginx reverse-proxy (com upstream para Node). Documentar comandos.
- Docker: imagem multi-stage incluindo backend; ou `docker-compose` com serviços `web` e `api`.
- Nginx: cache long-term com `immutable`; Brotli; compressão tipada.

### Backend
- Estruturar camadas (routes → controllers → services → repositories); middlewares comuns (errors, auth, validation).
- Schemas de entrada/saída; mensagens padronizadas; mapeamento de erros.

### Frontend
- API client resiliente (timeout/abort/retry). Apenas `default` export ou wrappers.
- `react-query`: chaves, `staleTime`, `cacheTime`, invalidations nas mutations.
- Navegação com `useNavigate`; evitar recarregar a página.

### Observabilidade
- Logs JSON com request-id; viewer centralizado.
- Health detalhado e métricas expostas; dashboards.

### Qualidade/CI
- Lint estrito e Typecheck no CI; cobertura mínima de testes; testes E2E básicos.

### Acessibilidade
- Aria labels, roles, foco visível; testes automáticos com axe.

---

## Critérios de aceite (amostra)
- Build de produção executa e serve SPA + APIs sob a mesma estratégia definida.
- `GET /api/health` retorna status estendido e passa no check do frontend.
- Nenhum uso de métodos nomeados da instância de API que dependam de `this`.
- Lighthouse Acessibilidade ≥ 90 em páginas principais.
- Pipeline CI verde (lint + typecheck + tests + build).

---

## Riscos e mitigação
- Mudança de deploy pode quebrar integrações → usar ambientes de staging e smoke tests.
- Endurecimento de CSP pode bloquear scripts/estilos → aplicar em modo report-only antes.
- Alterações no serviço de API exigem revisão de imports → buscar/ajustar automaticamente e revisar com testes.
