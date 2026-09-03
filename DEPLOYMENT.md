# Deployment

This repository contains a prototype website. The Vercel configuration deploys the Vite client from `client/` and supports direct loading of React Router routes.

## Vercel client

1. Import the repository into Vercel.
2. Leave the project root at the repository root. `vercel.json` supplies the install, build, and output settings.
3. Add `VITE_API_URL` as a Vercel environment variable. It must be the public URL of the separately hosted Express API, including `/api`, for example `https://api.example.com/api`.
4. Redeploy after adding the variable.

The API is not a Vercel Function: it uses Express, a local SQLite database, startup seeding, and session state. Host `server/` on a Node service with persistent storage, then set its production `ALLOWED_ORIGINS` and `FRONTEND_URL` to the Vercel URL. Do not commit either `.env` file or bootstrap credentials.
