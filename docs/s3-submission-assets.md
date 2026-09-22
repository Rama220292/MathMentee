# Private S3 submission assets

This document describes storage for the implemented student handwriting
workflow.

## Backend configuration

Set `AWS_REGION` and `AWS_S3_SUBMISSION_ASSETS_BUCKET` on the backend. If the
submission-specific bucket is omitted, the implementation falls back to
`AWS_S3_QUESTION_ASSETS_BUCKET` and still isolates objects under the submission
prefix. A separate production bucket is preferred.

The backend IAM principal requires `s3:PutObject` and `s3:GetObject` for:

```text
arn:aws:s3:::<private-bucket-name>/submission-source-images/*
```

Bucket CORS must allow `PUT` from the deployed frontend origin and local Vite
origin. This permits use of a valid presigned request; it does not make the
bucket public.

## Purpose

The original handwriting image is evidence of what the student submitted. It
is retained so an authorised tutor can compare it with the machine transcript
and the student's amended transcript during review. MongoDB stores the two text
representations and the S3 object metadata; it does not store the image binary.

## Storage boundary

- Keep submission images in a private S3 bucket with Block Public Access
  enabled.
- Use a distinct prefix such as
  `submission-source-images/<student-id>/<upload-id>.png`.
- Store only the object key, verified content type, size, and audit timestamps
  in MongoDB. Do not store a public URL.
- Use separate development and production buckets or strictly separated
  prefixes and IAM policies.
- Never expose AWS credentials through frontend code or `VITE_*` variables.

## Upload and ownership

The browser requests an owner-scoped, short-lived upload URL, uploads the
rendered handwriting image directly to S3, and confirms the opaque upload ID.
The backend resolves the expected object key from its own pending-upload record
and verifies the object metadata before associating it with a submission draft.

Students may create and access only their own drafts. Tutors may retrieve a
source image only while reviewing a submission they are authorised to access.
Access should be provided through an authorised backend operation or a
short-lived read URL; the bucket must not become public.

## Transcripts

The source image is sent server-side to the OCR/vision provider without the
model answer. MongoDB retains:

- `extracted_answer`: the untouched machine transcription;
- `confirmed_answer`: the student's corrections and explicit confirmation.

Only `confirmed_answer` is used for AI grading. Keeping both versions supports
audit and later measurement of OCR errors without duplicating text in S3.

## Retention

Retain the source image through tutor review so the tutor can inspect the
student's original work. A specific post-review deletion period must be chosen
before a pilot. Until then, images remain private and retained rather than being
deleted immediately after transcription.

Abandoned pending uploads should eventually be removed through an S3 lifecycle
rule and matching cleanup of expired MongoDB upload records.
