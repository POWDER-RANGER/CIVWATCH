# First API Call (Mock)

Until the API is live, use a mock server:

1. Start mock: `npm run api:mock`
2. Send request:
   curl -s http://localhost:3001/api/v1/health | jq
3. Expected response:
   { "status": "ok", "service": "civwatch-api" }

Once the real API is available, see docs/api.md for endpoints and auth.
