# Moria Peças e Serviços - Frontend

## Project info

**URL**: https://lovable.dev/projects/6155ec54-c567-4ed7-af25-16b5d9c539a9

## Estrutura do Projeto

Este projeto está organizado da seguinte forma:

```
src/
├── api/              # Clientes e serviços para comunicação com a API
├── components/       # Componentes reutilizáveis da interface
│   ├── admin/        # Componentes do painel administrativo
│   ├── customer/     # Componentes do painel do cliente
│   └── ui/           # Componentes de UI reutilizáveis
├── config/           # Configurações da aplicação
├── contexts/         # Contextos do React para gerenciamento de estado
├── hooks/            # Hooks customizados
├── lib/              # Bibliotecas e utilitários
├── pages/            # Páginas da aplicação
└── styles/           # Arquivos de estilo
```

## Arquitetura

A aplicação segue uma arquitetura cliente-servidor onde o frontend (esta aplicação) se comunica com um backend através de uma API REST.

### Estrutura da API

O frontend está preparado para se comunicar com um backend que fornece os seguintes endpoints:

- Autenticação: `/auth/login`, `/auth/register`, `/auth/profile`
- Produtos: `/products`
- Serviços: `/services`
- Promoções: `/promotions`
- Pedidos: `/orders`
- Endereços: `/addresses`
- Favoritos: `/favorites`

### Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis:

```
VITE_API_BASE_URL=http://localhost:3001/api
VITE_APP_ENV=development
VITE_APP_VERSION=1.0.0
```

Veja o arquivo `.env.example` para mais detalhes.

## Como posso editar este código?

Existem várias formas de editar esta aplicação.

**Usar o Lovable**

Simplesmente visite o [Projeto Lovable](https://lovable.dev/projects/6155ec54-c567-4ed7-af25-16b5d9c539a9) e comece a fazer prompts.

As mudanças feitas via Lovable serão automaticamente commitadas neste repositório.

**Usar sua IDE preferida**

Se você quiser trabalhar localmente usando sua própria IDE, você pode clonar este repositório e fazer push das mudanças. As mudanças feitas serão refletidas no Lovable.

O único requisito é ter Node.js & npm instalados - [instalar com nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Siga estes passos:

```sh
# Passo 1: Clone o repositório usando a URL Git do projeto.
git clone <SUA_URL_GIT>

# Passo 2: Navegue até o diretório do projeto.
cd <NOME_DO_SEU_PROJETO>

# Passo 3: Instale as dependências necessárias.
npm i

# Passo 4: Inicie o servidor de desenvolvimento com auto-reload e preview instantâneo.
npm run dev
```

**Editar um arquivo diretamente no GitHub**

- Navegue até o arquivo desejado(s).
- Clique no botão "Edit" (ícone de lápis) no canto superior direito da visualização do arquivo.
- Faça suas mudanças e commite as alterações.

**Usar GitHub Codespaces**

- Navegue até a página principal do seu repositório.
- Clique no botão "Code" (botão verde) próximo ao canto superior direito.
- Selecione a aba "Codespaces".
- Clique em "New codespace" para lançar um novo ambiente Codespaces.
- Edite os arquivos diretamente dentro do Codespace e commite e faça push das suas mudanças quando terminar.

## Quais tecnologias são usadas para este projeto?

Este projeto é construído com:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS
- Axios
- React Router DOM
- TanStack Query

## Como posso fazer deploy deste projeto?

Simplesmente abra o [Lovable](https://lovable.dev/projects/6155ec54-c567-4ed7-af25-16b5d9c539a9) e clique em Share -> Publish.

## Posso conectar um domínio personalizado ao meu projeto Lovable?

Sim, você pode!

Para conectar um domínio, navegue até Project > Settings > Domains e clique em Connect Domain.

Leia mais aqui: [Configurando um domínio personalizado](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)