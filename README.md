# CampusExpress

Smart campus logistics and vendor marketplace — full-stack (Express API + React/Vite frontend, React Router for real page routes).

## Routes

| Route | Who it's for |
|---|---|
| `/` | Landing — pick your role |
| `/marketplace` | Students — browse vendors |
| `/marketplace/:vendorId` | Students — order from a vendor |
| `/orders` | Students — track my orders |
| `/vendor` | Vendor portal — register a stall, manage items and incoming orders |
| `/rider` | Rider portal — claim ready orders, mark delivered |
| `/overview` | Business overview — live stats |
| `/legal` | Legal & ethics summary |

Each of these is a real URL (not just an in-app tab), so you can link people straight to `yourdomain.com/vendor` or `yourdomain.com/rider`.

## Project structure

```
campusexpress/
  server/     Express API + JSON file store (the "backend")
  client/     React + Vite + React Router (the "frontend")
```

The server serves the built client and answers `/api/*` requests — one deployable service.

## Run it locally

Requires Node.js 18+.

```bash
npm run install:all      # installs server + client dependencies

# two terminals:
npm run dev:server       # API on http://localhost:4000
npm run dev:client       # app on http://localhost:5173 (proxies /api to :4000)
```

Open http://localhost:5173.

## Deploy to Render

1. Push this folder to a GitHub repo.
2. In Render: **New → Web Service**, connect the repo.
   - Or use the included `render.yaml` blueprint: **New → Blueprint**, point it at the repo, and Render reads the settings automatically.
3. If setting up manually, use:
   - **Build command:** `npm run build`
   - **Start command:** `npm start`
   - **Environment:** Node
4. Once deployed, Render gives you a URL like `campusexpress.onrender.com`. Add your custom domain under **Settings → Custom Domains** and point your DNS (CNAME) at the Render URL Render shows you.

That single service handles both the API and the site — `/vendor`, `/rider`, `/marketplace`, etc. all resolve correctly because the server falls back to `index.html` for any non-`/api` route, and React Router takes it from there.

## Notes on the data store

`server/store.js` persists to a JSON file on disk. That's enough for a course project or demo, but Render's free-tier disk isn't guaranteed to survive a redeploy. When you're ready for real production use, swap `readData`/`writeData` in `store.js` for calls to a real database (Render offers managed Postgres) — no other file needs to change.
