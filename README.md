# HealthBridge

Multilingual community health education in English, Spanish, and Turkish. Vanilla HTML/CSS/JavaScript, a Node HTTP API, and an optional Java file-backed demo server. No login is required. Existing educational content and guardrails are preserved; the explainer is deterministic, not a medical model.

## Run and verify

Requires Node.js 24. Install dependencies and generate the production site:

```sh
npm ci
npm run build
npm start
```

Open http://localhost:3000. `npm run dev` watches server files. Rebuild after changing browser assets; when `dist/` exists the server serves that build. For source-only development, pass `webRoot: __dirname` to `createServer`, or work without `dist/`. All static hosting must use HTTP(S), at the domain root; opening `index.html` with `file://` is unsupported.

```sh
npm run lint
npm test              # builds first, then runs isolated SQLite/API/build/offline tests
npm audit --audit-level=high
```

## Assets, caching, and offline access

`npm run build` generates only public files in `dist/`: clean-css and Terser minify assets, SVGO optimizes the SVG, and Sharp generates compressed 192px/512px PNG icons. No PNG source assets existed initially. `build:css` and `build:js` can generate individual asset groups; run the full build to update HTML references and the service worker.

Content-hashed CSS, JS, and SVG assets receive one-year immutable caching. HTML, the manifest, the worker, and editorial JSON revalidate. Read-only catalog APIs support weak ETags and conditional GET/HEAD; metrics and all submission responses are `no-store`. Node negotiates Brotli/gzip; Java uses standard-library gzip. Vercel serves built assets through its CDN.

The versioned service worker caches the app shell and public editorial JSON. Navigations and unversioned data try the network first. APIs, user submissions, health prompts, and live metrics are never cached or queued offline. An offline notice identifies downloaded content; an offline fallback page and installable manifest are included. Service workers require HTTPS or localhost. Updates activate after older tabs close. Push notifications are not enabled: they require an opt-in flow, subscription storage, delivery infrastructure, and an agreed alert policy.

## Storage and backups

`DATABASE_URL` selects PostgreSQL. The Vercel project uses a free Neon database with a pooled connection URL and a pool of at most three connections per warm instance. Without it, local Node uses SQLite at `storage/healthbridge.sqlite`, with WAL and a busy timeout. Vercel refuses to silently fall back to temporary filesystem storage.

Only mutable metrics, feedback (latest 100), and aggregate performance measurements move to SQL. Reviewed educational content remains version-controlled JSON. Initialization runs idempotent schema creation and seeds the original sample dashboard once. Counters are updated atomically in a transaction; PostgreSQL row locks prevent lost updates across instances. Dashboard baselines are demonstration data, quiz counts are submissions rather than unique people, and pre/post chart data remains illustrative.

The CLI automatically loads `.env.local` (never committed). To use local SQLite when `.env.local` contains Neon credentials, set `DATABASE_URL` to an empty environment value. Backups include public feedback: keep them private.

```sh
npm run db:migrate
npm run db:backup                         # timestamped JSON under ignored backups/
npm run db:backup -- backups/manual.json  # refuses to overwrite an existing file
npm run db:restore -- backups/manual.json --replace
```

Restore atomically replaces application metrics and does not restore expired rate-limit buckets. Use a trusted backup from this app. For full PostgreSQL disaster recovery, also use the provider's recovery tools or `pg_dump` against the unpooled URL. Preview, development, and production initially share the provisioned resource; connect separate Neon branches before using previews for destructive data experiments.

## Security and monitoring

- Public-file allowlists prevent repository, dependency, secret, and database downloads. Vercel publishes `dist/` only.
- Helmet and matching CDN headers apply a Content Security Policy that rejects inline scripts. Browser controls use event listeners; legacy inline styles remain allowed.
- JSON bodies are capped at 32 KiB. Types, lengths, locale, ratings, quiz fields, and telemetry values are checked before use. Submitted feedback is HTML-escaped when displayed. Known PII patterns are rejected; do not submit personal information.
- Writes require JSON and reject cross-origin browser submissions using Origin/Fetch Metadata. There are no authentication cookies or session credentials. Non-browser clients may submit JSON without Origin.
- API rate limits are 300 reads and 30 writes per minute per IP. PostgreSQL shares counters across instances; SQLite mode uses bounded process-local counters. PostgreSQL stores keyed hashes rather than IPs and removes expired buckets. Only Vercel's platform-managed client IP header is trusted there. Other proxies need explicit configuration; forwarded headers are not trusted locally.
- A 64-request concurrency cap sheds load; there are no costly background operations requiring a durable queue.
- API logs include normalized route, status, and duration, excluding request bodies, queries, and IPs. Web Vitals records aggregate LCP, INP, CLS, and bounded JavaScript error counts at `/api/telemetry`. DNT/GPC preferences are respected. No third-party analytics or session replay is installed; no prompt or error-message content is transmitted by telemetry.
- Performance aggregates are available in `/api/metrics` under `performance`. Request logs are available in Vercel logs. `/api/health` checks initialization/readiness.

Read [web-vitals documentation](https://github.com/GoogleChrome/web-vitals) for metric definitions. INP is used in place of the older FID metric.

## Deploy

The Vercel configuration serves `dist/` plus `api/index.js`, which adapts the same Node handler. Neon environment variables are provided through the project's Marketplace integration. Git integration deploys production from `main` and previews from other branches. The build must succeed before publication.

```sh
vercel link
vercel env pull .env.local
vercel deploy --prod
```

GitHub Actions checks lint, the production build, Node tests, dependency audit, Java compilation/smoke tests, both Docker builds, and Node container health. Dependabot proposes dependency and action updates. Do not commit `.env.local`, backups, or database files.

```sh
docker compose up --build
docker compose --profile java up --build
```

The Node service listens on port 3000 and retains SQLite in a named volume. Set `DATABASE_URL` to use Postgres. Both images use multiple build stages and unprivileged runtime users. The optional Java service listens on host port 3001. Java 21 can also run directly after `npm run build`:

```sh
javac HealthWebService.java
java HealthWebService
```

Java remains a file-backed reference implementation: it returns raw catalog JSON consumed by the client's fallback handling, seeded metrics, and a conservative explainer fallback. Persistent writes and Web Vitals collection require the Node API. It has gzip, ETags, method checks, bounded explainer bodies, basic rate limits, security headers, and restricted static serving. Run it behind a proxy with connection timeouts for public use.
