# Manual Render deployment

Keep the existing running deployment as production. Create separate staging
services through the Render dashboard. `render.yaml` defines staging only as an
optional reference; manual service creation does not require a Blueprint.

## Staging API

Choose **New > Web Service**, connect `Rama220292/MathMentee`, and use:

| Setting | Value |
| --- | --- |
| Name | mathmentee-api-staging |
| Branch | main |
| Runtime | Node |
| Region | Singapore |
| Root directory | backend |
| Build command | npm ci |
| Start command | npm start |
| Health check path | /health |
| Auto-Deploy | Off |

Choose a paid instance for Gmail SMTP verification emails. Render's free web
services block outbound SMTP ports. Check current pricing before selecting.

In **Environment**, add settings from `backend/.env.staging`, correcting:

- `FRONTEND_URL` and `CORS_ORIGIN`: actual staging frontend origin, including
  `https://`, without a path or trailing slash. Replace the local placeholders.
- `MONGO_URI` and `JWT_SECRET`: staging database and secret, separate from prod.
- `OPENAI_API_KEY`, `EMAIL_USER`, and `EMAIL_PASS`: server-side credentials.
- `AWS_REGION`, `AWS_S3_QUESTION_ASSETS_BUCKET`, `AWS_ACCESS_KEY_ID`, and
  `AWS_SECRET_ACCESS_KEY`: private staging storage settings. The local file
  repeats the bucket key; use one correct staging value.
- `NODE_VERSION=22`, `NODE_ENV=production`, and `APP_ENV=staging`.

Omit the local `PORT` setting and use Render's assigned port. An optional
`AWS_S3_SUBMISSION_ASSETS_BUCKET` provides separate submission storage;
otherwise submissions use the staging question-assets bucket. Keep credentials
on the API only. The app does not automatically select `.env.staging` or
`.env.production`; environment files remain uncommitted.

Allow the API's Render outbound addresses in MongoDB network access. Configure
private staging S3 bucket CORS for the staging frontend origin and the presigned
upload method and headers used by the application.

## Staging frontend

Choose **New > Static Site** and connect the same repository:

| Setting | Value |
| --- | --- |
| Name | mathmentee-web-staging |
| Branch | main |
| Root directory | frontend |
| Build command | npm ci --include=dev && npm run build |
| Publish directory | dist |
| Auto-Deploy | Off |
| NODE_VERSION | 22 |
| VITE_BACK_END_SERVER_URL | Actual staging API public URL followed by /api |

Under **Redirects/Rewrites**, add source `/*`, destination `/index.html`, and
action **Rewrite**. Once Render assigns the frontend URL, set that origin on
the staging API's `FRONTEND_URL` and `CORS_ORIGIN`, then redeploy the API.
The API requires a valid frontend URL to start; if deploying it first, use the
intended staging origin initially and replace it with the actual assigned URL.

## Verify and release

1. Confirm staging API `/health` returns `{"status":"ok"}` and visiting
   frontend `/login` directly renders the app.
2. Check signup and email verification, login, image upload and extraction,
   draft review and publication, student practice, and teacher review. Confirm
   student responses omit private authoring data and source images.
3. For manual production releases, set **Auto-Deploy** to **Off** on the existing
   production services. Sharing `main` does not isolate releases when automatic
   deployment is enabled. A dedicated staging branch can be introduced later.
4. After staging passes, use the existing production service's
   **Manual Deploy > Deploy a specific commit** to release the tested commit.
   If the production frontend is hosted separately, deploy its matching commit
   there too. Retain production database, buckets, URLs, and credentials.

The optional staging Blueprint wires external URLs automatically. Manual
service creation requires entering them as described above. Existing production
services are not included in this Blueprint.

References: [Node/Express deployment](https://render.com/docs/deploy-node-express-app),
[static sites](https://render.com/docs/static-sites),
[manual deploys](https://render.com/docs/deploys), and
[free-service limits](https://render.com/docs/free).
