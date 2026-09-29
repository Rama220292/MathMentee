# Backend environment and verification emails

The API loads configuration before importing routes or creating the email
transport, and refuses to start unless `FRONTEND_URL` is an absolute HTTP(S) URL.
Use the frontend origin, including `https://`, as the value. It is a backend
setting; a frontend `VITE_*` setting does not configure verification emails.

Both `npm start` and `npm run dev` load only `backend/.env`, using a path relative
to the backend directory, independent of the working directory. `APP_ENV` and
`NODE_ENV` do not select alternate files. Set `FRONTEND_URL` in `backend/.env`
to the frontend origin (for local development, `http://localhost:5173`).

Existing process environment variables take precedence over files. Files are
optional for hosted deployments.
Development uses Node's watch mode so Bun's automatic environment loading does
not preload a different file ahead of the application's loader.

For Render, set `FRONTEND_URL` on the API service to the deployed frontend origin,
then restart or redeploy the API. Keep `CORS_ORIGIN` aligned separately. Correcting
the setting does not repair links in emails already sent. Environment files and
SMTP credentials must remain uncommitted.
