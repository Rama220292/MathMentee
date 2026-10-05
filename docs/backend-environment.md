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

See [Render staging and production](render-deployment.md) for manual staging setup,
required storage settings, and releases to the existing production deployment.

## Content-manager registration

`ENABLE_CONTENT_MANAGER_SIGNUP` defaults to disabled when omitted. Keep it at
`false` to disable the content-manager signup option and reject direct signup
requests for that role. Existing content-manager accounts can still sign in and
manage questions, and student and teacher registration remain available.

To re-enable registration, set `ENABLE_CONTENT_MANAGER_SIGNUP=true` in
`backend/.env` or the hosted API service environment, then restart or redeploy
the backend. The frontend obtains the available roles from
`GET /api/auth/signup-options`, so no frontend environment flag or rebuild is
required. Only the exact value `true` enables registration.
