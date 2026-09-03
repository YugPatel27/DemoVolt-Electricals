# DemoVolt Electricals

DemoVolt Electricals is a prototype electrical supplies catalogue website. It uses fictional products, brands, contact details, locations, and enquiry data for demonstration only.

## Stack

- React 18 and Vite client
- Express API server
- SQLite database for local prototype data
- Vercel-ready client deployment

## Project Structure

- `client/` - React and Vite frontend
- `server/` - Express API and SQLite-backed services
- `vercel.json` - Vercel configuration for the frontend
- `DEPLOYMENT.md` - Deployment notes and environment setup

## Local Development

Install dependencies:

```bash
npm --prefix client install
npm --prefix server install
```

Start the API in one terminal:

```bash
npm --prefix server start
```

Start the frontend in another terminal:

```bash
npm --prefix client run dev
```

Open `http://localhost:5000` in a browser.

## Environment

Copy the server environment template to `server/.env` and adjust values for local development. The client uses `VITE_API_URL` from `client/.env`; leave it empty locally to use the Vite proxy, or set it to a separately hosted API URL ending in `/api`.

Do not commit `.env` files or real credentials. All contact values in this prototype are intentionally redacted as `XX`.

## Deployment

The Vercel configuration builds and serves the `client/` application with SPA route rewrites. The Express API is not a Vercel Function because it uses SQLite, startup initialization, and server-side session handling. Host the API separately with persistent storage and configure `VITE_API_URL` in Vercel.

See [DEPLOYMENT.md](DEPLOYMENT.md) for the complete deployment checklist.

## Status

This is a prototype website. Product information, brands, contact details, locations, and submitted form data should not be treated as real commercial information.
