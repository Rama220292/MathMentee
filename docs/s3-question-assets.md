# Private S3 question assets

Question source images are authoring assets. Keep them in a dedicated private
S3 bucket with Block Public Access enabled. Do not configure a public bucket
policy, static website hosting, or a CloudFront public origin for this bucket.

## Backend configuration

Set these variables on the backend service:

```text
AWS_REGION=ap-southeast-1
AWS_S3_QUESTION_ASSETS_BUCKET=<private-bucket-name>
```

The AWS SDK uses its standard credential chain. On Render, provide
`AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` as secret environment variables
for a dedicated IAM principal. On AWS-hosted compute, prefer an attached IAM
role instead. Never add credentials to `.env.example`, frontend code, or a
`VITE_*` variable.

The backend principal only needs permission to create presigned uploads in the
question-source prefix:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": "s3:PutObject",
      "Resource": "arn:aws:s3:::<private-bucket-name>/question-source-images/*"
    }
  ]
}
```

The later upload-confirmation increment will also require narrowly scoped
`s3:HeadObject` access so the backend can validate that the expected object was
uploaded before saving its key to a draft.

## Bucket CORS

S3 must allow the deployed frontend and local Vite development origin to send
the presigned `PUT`. Replace the production example with the real Netlify URL:

```json
[
  {
    "AllowedOrigins": [
      "https://<site-name>.netlify.app",
      "http://localhost:5173"
    ],
    "AllowedMethods": ["PUT"],
    "AllowedHeaders": ["Content-Type"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 300
  }
]
```

CORS does not make the bucket public. It only permits a browser at an approved
origin to use an otherwise valid presigned request.

## Recommended bucket controls

- Enable all four S3 Block Public Access settings.
- Enable default server-side encryption (SSE-S3 is sufficient for this first
  increment; use SSE-KMS only if its operational overhead is required).
- Disable ACLs with Bucket owner enforced object ownership.
- Add a lifecycle rule for abandoned objects under `question-source-images/`
  after the draft/confirmation lifecycle is implemented.
- Do not log bucket names, presigned URLs, or source object keys in
  student-facing responses.
