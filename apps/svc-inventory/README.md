# svc-inventory

Minimal inventory microservice for stock checks and substitutions.

## Endpoints
- `GET /health`
- `GET /inventory/:sku` → returns `{ sku, stock, preferredSupplier, altSuppliers[] }` or 404
- `POST /substitution` → body `{ items: [{ sku, qty }] }` → returns `{ suggestions: [...] }`

## Dev
```bash
cp .env.example .env
pnpm dev
```

## Curl smoke

```bash
curl localhost:4002/health
curl localhost:4002/inventory/LPT-13
curl -X POST localhost:4002/substitution -H 'content-type: application/json' \
  -d '{"items":[{"sku":"LPT-13","qty":2},{"sku":"MON-27","qty":5}]}'
```
