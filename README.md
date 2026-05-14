# HR Frontend Bootstrap

## Local setup

1. Install dependencies with `npm install`.
2. Create `.env.local` and set `NEXT_PUBLIC_API_BASE_URL=http://localhost:8025`.
3. Start the backend so Swagger is reachable at `http://localhost:8025/api/docs#`.
4. Run the frontend with `npm run dev`.

## Quality checks

- TypeScript: `npx tsc --noEmit`
- Lint: `npm run lint`
- Unit tests: `npm test`

The Sprint 1 auth and company screens use the shared Axios client in `src/lib/api-client.ts`. The live Swagger spec currently exposes endpoint paths and response codes but no request/response schemas, so local API types are encoded in `src/types/api.ts` from the Sprint 1 contract and should be regenerated when backend schemas become available.
