# Relatório de Qualidade e Riscos – Moria Peças e Serviços

## Sumário executivo
- **Confiabilidade (alta prioridade)**: API com dados em memória; export incorreto de métodos do serviço de API pode quebrar chamadas quando importados de forma nomeada; inconsistências de portas entre documentação, proxy e servidor.
- **Segurança (alta prioridade)**: CSP permite `'unsafe-inline'`; ausência de autenticação real, rate limiting e validação robusta; CORS de produção com fallback genérico.
- **Manutenibilidade (média/alta)**: Duplicidade de estratégia de deploy (Node servindo SPA vs Nginx estático); repositório com artefatos residuais; engines do Node divergentes entre frontend e backend.
- **Performance (média)**: Cache Nginx conservador para assets com hash; ausência de Brotli; `fetch` sem timeout/abort/retry.
- **Acessibilidade/UX (média)**: Botões icônicos sem `aria-label`; navegação via `window.location.href` perde estado do SPA.

---

## Escopo e metodologia
- Análise estática do código e configs: frontend (React+Vite+TS), backend (Express), Docker/Nginx, ESLint/Tailwind.
- Sem execução ou testes automatizados (a configurar).

---

## Achados detalhados

### Arquitetura e Deploy
- **Duas abordagens de deploy em conflito**:
  - Backend Express serve o build do frontend em produção (`backend/src/server.js`).
  - Dockerfile atual constrói o frontend e serve somente via Nginx, sem o backend Node incluso.
  - Risco: 404 em `/api/*` se usar apenas o container Nginx; inconsistência operacional.
- **Inconsistência de portas (documentação vs código)**:
  - Vite proxy → `http://localhost:3081`.
  - `server.js` default `PORT=3081` (ok). Documentação menciona `3080` e o exemplo também exibe 3080.
  - Risco: confusão local e em deploy; falhas de conexão.
- **Artefatos/diretórios residuais** no repo: `deploy-fix.tar.gz`, `dist-fix.tar.gz`, `moria-complete.tar.gz`, `backendsrc*`.
  - Risco: repositório pesado, risco de uso accidental e perda de clareza.

### Backend (Express)
- **CSP permissiva**: `'unsafe-inline'` em `scriptSrc` e `styleSrc`.
  - Risco: maior superfície para XSS. Ideal: nonces/hashes.
- **CORS**: Em produção usa `ALLOWED_ORIGIN` com fallback `https://yourdomain.com`.
  - Risco: comportamento inesperado se a env não for configurada; ideal falhar explicitamente/semi-lista.
- **Dados em memória** (produtos, pedidos, serviços).
  - Risco: perda a cada restart; ok para demo.
- **Validação**: validações ad hoc com `parseFloat/parseInt`; sem schema.
  - Risco: dados inconsistentes e mensagens de erro não padronizadas.
- **Observabilidade**: logs simples com timestamp; sem níveis/JSON, sem métricas ou tracing.
- **Segurança de API**: sem autenticação/autorização; sem rate limiting/brute-force protection.

### Frontend (React + Vite + TypeScript)
- **Bug crítico no serviço de API** em `src/services/api.js`:
  - Exporta métodos nomeados por destruturação da instância: isso perde o `this` (usado internamente), quebrando chamadas quando importados como funções soltas.
  - O arquivo recomenda esse uso nos exemplos, induzindo ao erro em runtime.
- **Cliente HTTP**:
  - Sem `AbortController`/timeout; sem retries/backoff; sem padronização de erros; sem integração direta com `react-query` (apesar de presente no app).
- **Roteamento**:
  - Uso de `window.location.href` no `Header` para `/customer` em vez de `useNavigate`.
  - Impacto: recarrega página e perde estado de SPA.
- **Acessibilidade**:
  - Botões com ícones sem `aria-label`.
- **Estado/Auth**:
  - `AuthContext` simula login e persiste em `localStorage` (dev). Sem expiração/refresh/autorizações por rota.
- **Lint/Tipos**:
  - `@typescript-eslint/no-unused-vars` desativado; reduz cobertura do lint.

### DevEx e Configuração
- **Engines Node**:
  - Frontend (Vite 5) requer Node >= 18; backend declara `>=16`. Inconsistente.
- **Scripts**:
  - Testes placeholders; sem `typecheck` (`tsc --noEmit`); sem CI.
- **Vite server.host `"::"`**:
  - Pode causar fricções no Windows/rede; avaliar `"0.0.0.0"`.

### Nginx (se usado com o Dockerfile atual)
- **Cache**:
  - JS/CSS com 1h; com arquivos com hash é seguro long-term cache + `immutable`.
- **Compressão**: Gzip on; Brotli ausente.
- **SPA fallback**: ok.

### Segurança (resumo)
- CSP permissiva; CORS default genérico; sem auth/rate limit; sessão em `localStorage` (dev); sem sanitização robusta.

---

## Evidências (citações do código)
- Export problemático no serviço de API:
```startLine:182:endLine:206:src/services/api.js
// Instância singleton
const api = new ApiService();

// ========================================
// EXPORT - Métodos diretos para facilitar uso
// ========================================

export default api;

// Exports nomeados para conveniência
export const {
  healthCheck,
  getDashboardStats,
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  getOrders,
  createOrder,
  getServices,
  formatPrice,
  formatDate,
  formatDateTime
} = api;
```
- Exemplo no próprio arquivo induzindo ao uso nomeado:
```startLine:212:endLine:220:src/services/api.js
// Ou importar métodos específicos
import { getProducts, createProduct } from '@/services/api.js';
const products = await getProducts({ category: 'Filtros' });
```
- Proxy Vite para 3081 vs docs 3080:
```startLine:11:endLine:18:vite.config.ts
proxy: {
  '/api': {
    target: 'http://localhost:3081',
    changeOrigin: true,
    secure: false,
  }
}
```
```startLine:76:endLine:83:BACKEND_README.md
### Desenvolvimento
- **Frontend:** http://localhost:8080
- **Backend:** http://localhost:3080
- **APIs:** http://localhost:8080/api/* (proxy automático)
```
- Navegação imperativa no Header:
```startLine:62:endLine:72:src/components/Header.tsx
<Button 
  variant="ghost" 
  size="icon" 
  className="hover:text-moria-orange"
  onClick={() => {
    if (isAuthenticated) {
      window.location.href = '/customer';
    } else {
      setShowLoginDialog(true);
    }
  }}
>
```
- Dockerfile servindo apenas frontend com Nginx:
```startLine:30:endLine:43:Dockerfile
# Estágio de produção com Nginx
FROM nginx:alpine

# Copiar arquivos buildados
COPY --from=builder /app/dist /usr/share/nginx/html

# Copiar configuração customizada do Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expor porta 80
EXPOSE 80

# Iniciar Nginx
CMD ["nginx", "-g", "daemon off;"]
```
- CSP permissiva:
```startLine:13:endLine:23:backend/src/server.js
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https:"],
    },
  },
}));
```

---

## Riscos priorizados
- P0/Critico: export do serviço de API; estratégia de deploy inconsistente (Nginx vs Node); inconsistências de porta; CSP com `'unsafe-inline'`.
- P1/Alto: falta de autenticação/autorizações; ausência de rate limiting; validação fraca; engines Node divergentes.
- P2/Médio: acessibilidade (aria-label), navegação via `window.location.href`, cache Nginx subaproveitado, ausência de Brotli.
- P3/Baixo: artefatos no repo, regra de lint relaxada, host Vite `"::"`.

---

## Oportunidades de melhoria (alto nível)
- Consolidar estratégia de deploy (Node servindo SPA + APIs, ou Nginx como reverse-proxy para Node).
- Corrigir export do serviço de API (usar apenas a instância default ou criar wrappers estáticos).
- Endurecer CSP e CORS; adicionar rate limiting e autenticação.
- Aproveitar `react-query` para caching/invalidation; adicionar `AbortController`/timeouts.
- Melhorar caching (long-term com `immutable`) e compressão (Brotli).
- Uniformizar Node >= 18 no backend; adicionar `typecheck`, testes e CI.
- Acessibilidade: `aria-label` em botões icônicos, foco visível.
- Limpeza do repositório e `.env.example`.

---

## Conclusão
A base está sólida para demonstração. Para produção, resolver imediatamente o export do serviço de API, alinhar a estratégia de deploy e reforçar segurança (CSP/CORS/Auth/Limites), validação e consistência de ambiente.
