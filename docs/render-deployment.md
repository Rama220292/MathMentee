# Development, staging, and production deployment

MathMentee has three environments. Development runs from a local desktop;
staging and production each use a Render backend and a Netlify frontend.

| Environment | Deployment branch | Backend | Frontend |
| --- | --- | --- | --- |
| Development | Local working branch | Local desktop: `http://localhost:5000` | Local desktop: `http://localhost:5173` |
| Staging | `staging` | https://mathmentee-staging.onrender.com | https://staging--mathmentors.netlify.app (branch deploy) |
| Production | `main` | https://mathmentors.onrender.com | https://mathmentors.netlify.app |

Keep each environment's database, JWT secret, and private S3 storage isolated.
Keep the existing production services and their production credentials.
The staging URL follows Netlify’s branch-deploy naming convention; confirm it
after the first successful staging deployment. Both frontends use one Netlify
project, with production on `main` and staging as a branch deploy.

## Development

Run the backend and frontend on the local desktop using the
[README instructions](../README.md#local-development). The backend loads
`backend/.env`; the frontend uses `frontend/.env`. Set:

- Backend `FRONTEND_URL` and `CORS_ORIGIN`: `http://localhost:5173`.
- Frontend `VITE_BACK_END_SERVER_URL`: `http://localhost:5000/api`.

`APP_ENV` and `NODE_ENV` do not select alternate backend environment files.
See [backend configuration](backend-environment.md).

## Render backends

Configure separate Node web services connected to `Rama220292/MathMentee`:

| Setting | Staging | Production |
| --- | --- | --- |
| Branch | `staging` | `main` |
| Public URL | `https://mathmentee-staging.onrender.com` | `https://mathmentors.onrender.com` |
| Root directory | `backend` | `backend` |
| Build command | `npm ci` | `npm ci` |
| Start command | `npm start` | `npm start` |
| Health check path | `/health` | `/health` |
| NODE_VERSION | `22` | `22` |
| NODE_ENV | `production` | `production` |
| APP_ENV | `staging` | `production` |
| Auto-Deploy | Off (manual release workflow) | Off (manual release workflow) |

Configure each service's environment variables in Render:

- `FRONTEND_URL` and `CORS_ORIGIN`: its Netlify frontend origin, including
  `https://`, without a path or trailing slash. Production uses
  `https://mathmentors.netlify.app`; staging uses
  `https://staging--mathmentors.netlify.app`.
- `MONGO_URI` and `JWT_SECRET`: that environment's database and signing secret.
- `OPENAI_API_KEY`, `EMAIL_USER`, and `EMAIL_PASS`: server-side credentials.
- `AWS_REGION`, `AWS_S3_QUESTION_ASSETS_BUCKET`, `AWS_ACCESS_KEY_ID`, and
  `AWS_SECRET_ACCESS_KEY`: that environment's private storage settings.
- Optional `AWS_S3_SUBMISSION_ASSETS_BUCKET`: separate submission storage;
  otherwise submissions use the question-assets bucket.

Use Render's assigned port rather than copying a local `PORT` setting. Hosted
process variables take precedence; the app does not automatically load
`.env.staging` or `.env.production`. Keep environment files uncommitted and
credentials on the backend only.

Allow each backend's outbound addresses in its MongoDB network access settings.
Configure each private S3 bucket's CORS for its corresponding frontend origin
and the presigned upload method and headers used by the application. Email
verification requires hosting that supports the configured SMTP transport.

## Netlify frontends

Use the existing `mathmentors` Netlify project connected to the repository.
Under **Project configuration > Developer settings > Continuous deployment >
Branches and deploy contexts**, keep the production branch as `main`, enable
branch deploys for the individual branch `staging`, and save.

| Setting | Staging | Production |
| --- | --- | --- |
| Deployment branch | `staging` (branch deploy) | `main` (production branch) |
| Frontend URL | `https://staging--mathmentors.netlify.app` | `https://mathmentors.netlify.app` |
| Base directory | `frontend` | `frontend` |
| Build command | `npm run build` | `npm run build` |
| Publish directory | `dist` | `dist` |
| NODE_VERSION | `22` | `22` |
| VITE_BACK_END_SERVER_URL | `https://mathmentee-staging.onrender.com/api` | `https://mathmentors.onrender.com/api` |

Set `VITE_BACK_END_SERVER_URL` using contextual values in Netlify: the
**Production** context gets the production API URL, and the specific branch
**staging** gets the staging API URL. Make the variable available during builds.
`netlify.toml` provides shared build settings and the SPA rewrite from `/*` to
`/index.html`. Rebuild after changing frontend environment variables.

Push to `staging` to trigger its branch deployment. Confirm the generated URL
in Netlify's Deploys page, then set that origin on the staging API's
`FRONTEND_URL` and `CORS_ORIGIN` and in staging S3 CORS. Redeploy the API.
The backend requires a valid frontend URL to start. Preserve the manual
production release gate described below.

References: [Netlify branch deploys](https://docs.netlify.com/deploy/deploy-types/branch-deploys/)
and [contextual environment variables](https://docs.netlify.com/build/environment-variables/overview/).

## Verify and release

1. Develop and test on the local desktop, then push the candidate to `staging`.
2. Deploy the same staging revision to the staging Render backend and Netlify
   frontend. Confirm API `/health` returns `{"status":"ok"}` and visiting
   frontend `/login` directly renders the app.
3. Check signup and email verification, login, image upload and extraction,
   draft review and publication, student practice, and teacher review. Confirm
   student responses omit private authoring data and source images.
4. After staging passes, promote the tested changes to `main`. Deploy the
   matching production revision to both Render and Netlify. If promotion adds
   changes beyond the tested revision, validate those changes in staging first.
5. Retain production database, buckets, URLs, and credentials, then repeat
   health and login checks on the production URLs.

## Deployment configuration caveat

The existing `render.yaml` reflects the former staging arrangement: it uses
`main` and includes a Render static frontend. It does **not** implement this
architecture. Do not apply it as the setup for these environments. Configure
services through the dashboards until the Blueprint is updated separately.
`netlify.toml` supplies frontend build settings; deployment branches and
context-specific environment variables are configured in Netlify.
