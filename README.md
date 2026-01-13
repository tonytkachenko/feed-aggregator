# Feed Aggregator

A simple RSS/XML feed aggregator built with Hono. It fetches a list of feed URLs from a remote text file, merges items into a single RSS feed, and returns the aggregated XML.

## Features
- GET-only aggregation endpoint
- Accepts a feed list URL
- Parallel fetching with timeout
- XML parsing and rebuilding
- Useful metadata in response headers

## API

### GET /aggregate
Query parameters:
- `list` (required): URL to a text file containing feed URLs

Feed list format (text file):
- One URL per line
- Empty lines are ignored
- Lines starting with `#` are treated as comments

Example:
```bash
curl "http://localhost:8787/aggregate?list=https://example.com/feeds.txt"
```

Response:
- Content-Type: `application/xml; charset=utf-8`
- Headers:
  - `X-Total-Items`
  - `X-Total-Feeds`
  - `X-Successful-Feeds`
  - `X-Failed-Feeds`
  - `X-Duration-Ms`
  - `X-Timestamp`

Errors:
```json
{ "error": "message" }
```

### GET /logs/:key
Returns the last 200 lines of PM2 logs. The `:key` value must match `LOGS_ACCESS_KEY`.

## Configuration

Environment variables (see `.env.example`):
- `REQUEST_TIMEOUT_MS` (default: 15000)
- `NODE_ENV` (`development` or `production`)
- `LOGS_ACCESS_KEY` (required, access token for `/logs/:key`)

## Development

Install dependencies:
```bash
pnpm install
```

Copy env file:
```bash
cp .env.example .env
```

Run locally (Cloudflare Workers via Wrangler):
```bash
pnpm dev
```

Type-check:
```bash
pnpm type-check
```

## Deployment

Cloudflare Workers:
```bash
pnpm deploy
```

Vercel:
- This repo includes `api/index.ts` and `vercel.json` for a minimal adapter.
- Ensure your platform environment variables match `.env.example`.

## Project Structure
- `src/index.ts` - Hono app and routes
- `src/lib/` - feed loader, XML parser, aggregator, config
- `api/index.ts` - Vercel entry (rewrites in `vercel.json`)

## License
MIT
