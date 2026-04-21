# Viajei!

Gerador de roteiros de viagem com IA. Next.js 15 (App Router) + Tailwind v4 + shadcn/ui, chamando a API da Anthropic no servidor com `claude-opus-4-7`.

## Requisitos

- Node.js 20+
- Uma chave da Anthropic API

## Setup

```bash
# 1. Instale as dependências
npm install

# 2. Crie seu .env.local a partir do exemplo e cole sua chave
cp .env.local.example .env.local
# edite .env.local e preencha ANTHROPIC_API_KEY=sk-ant-...

# 3. Rode em dev
npm run dev
```

Abra http://localhost:3000.

## Scripts

- `npm run dev` — servidor de desenvolvimento
- `npm run build` — build de produção
- `npm run start` — servidor de produção
- `npm run lint` — ESLint
- `npm run typecheck` — TypeScript em modo `--noEmit`

## Como funciona

1. O usuário preenche cidade, dias (1–14), moeda (BRL/USD/EUR) e chips de palavras-chave (brainstorming).
2. O client faz `POST /api/generate-itinerary`.
3. A API Route valida com Zod, aplica rate limiting por IP, e chama o Claude via `@anthropic-ai/sdk`.
4. A resposta é forçada via `tool_choice` com JSON Schema estruturado (`deliver_itinerary`), validada novamente com Zod antes de retornar.

## Imagens (Pexels)

Cada atividade ganha uma foto num carrossel no topo do card do dia.

1. Pegue uma API Key grátis em https://www.pexels.com/api/.
2. Cole em `PEXELS_API_KEY` no `.env.local`.
3. Pronto. Sem a key, o app continua funcionando — só não renderiza as imagens.

O modelo gera um `imageQuery` curto em inglês por atividade (~5 tokens extras cada). O servidor chama `GET https://api.pexels.com/v1/search`, faz cache em memória (24h, até 500 entradas, LRU) e injeta a URL no JSON. O Next.js carrega as imagens direto de `images.pexels.com` com `remotePatterns` liberado e a CSP já ajustada.

Atribuição ao fotógrafo e link para Pexels estão na UI, conforme as diretrizes da API (limite grátis: 200 req/h, 20k/mês).

## Tokens e limites

Cada chamada à Anthropic retorna o `usage` (tokens de entrada e saída). O app:

- Loga no console do servidor: `[generate-itinerary] usage input=… output=… total=… stop=… budget_spent=…`.
- Devolve `usage` no corpo JSON da resposta (`inputTokens`, `outputTokens`, `totalTokens`) e exibe em fonte discreta abaixo do botão "Gerar outro roteiro".
- Aceita `ANTHROPIC_DAILY_TOKEN_BUDGET` (opcional) — teto total de tokens em uma janela rolante de 24h. Ao atingir, responde `429 BUDGET_EXCEEDED` com `Retry-After`. O contador vive em memória (reset no restart do processo).
- `max_tokens` por chamada fixado em 8192. Se o modelo truncar, a rota retorna `502 TRUNCATED` com mensagem clara.

## Segurança

- A chave fica apenas no servidor (`process.env.ANTHROPIC_API_KEY`) — nunca exposta ao cliente.
- Validação estrita de entrada (Zod + regex allowlist) e de saída (schema do roteiro).
- Rate limit em memória por IP (5 req/min) para mitigar abuso.
- Limite de tamanho de corpo (8 KB) e `Content-Type` obrigatório.
- Headers de segurança: CSP, `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, `poweredByHeader: false`.
- System prompt com defesa contra prompt injection; input do usuário é delimitado em tags.
- Mensagens de erro amigáveis — não vazam stack traces.
- `.env*` está no `.gitignore`.

## Deploy (Vercel)

1. Faça push do repositório no GitHub.
2. Em **Vercel → New Project**, importe o repo.
3. Em **Environment Variables**, adicione `ANTHROPIC_API_KEY` com sua chave.
4. Deploy. A API Route roda no runtime Node.js serverless (`runtime = "nodejs"`).

> Observação: o rate limit é em memória. Em produção com múltiplas instâncias, troque por um store compartilhado (Upstash, Redis, Vercel KV).

## Estrutura

```
app/
  api/generate-itinerary/route.ts   # POST endpoint (server-side)
  globals.css                        # Tailwind v4 + theme tokens
  layout.tsx                         # Geist + ThemeProvider
  page.tsx                           # Página principal
components/
  ui/                                # primitives shadcn
  itinerary-form.tsx                 # formulário + chips de keywords
  itinerary-result.tsx               # resumo + dias + dicas
  day-card.tsx                       # timeline do dia
  itinerary-skeleton.tsx             # loading state
  theme-provider.tsx                 # next-themes
  theme-toggle.tsx                   # toggle dark/light
lib/
  anthropic.ts                       # cliente Anthropic
  rate-limit.ts                      # limitador em memória por IP
  schema.ts                          # schemas Zod (request + response)
  types.ts                           # tipos TypeScript
  utils.ts                           # cn() + formatCurrency()
```

## Disclaimer

Estimativas e sugestões são geradas por IA e podem estar imprecisas. Confira valores, horários e restrições atualizadas antes de viajar.
