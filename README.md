# Spotify Clone (S3 Streaming + Realtime UI)
**What it is:** Full-stack Spotify-style starter. Backend returns presigned S3 URLs; frontend streams audio directly from S3. Realtime via Socket.IO.  
**Goal:** You deploy without touching code—only provide S3 details via `.env` or the installer script.

## Quick EC2 deploy (backend only)
1) SSH to your EC2 (Ubuntu 22.04).
2) Upload this zip and unzip: `unzip spotify-clone-s3-realtime.zip -d app && cd app/server/deploy`
3) Run the installer:
```bash
./install_ec2.sh
```
- It installs Node, PM2, Nginx.
- Detects region automatically.
- Asks for **S3 bucket** and **prefix** and creates `.env`.
- Starts the API and optionally configures Nginx proxy.

## Frontend (local dev)
```
cd web
npm i
npm run dev
```
Set `VITE_API_BASE` if your API is on a domain/ip.

## S3 permissions & CORS
IAM policy should allow:
- `s3:PutObject`, `s3:GetObject` on `arn:aws:s3:::YOUR_BUCKET/*`
- `s3:ListBucket` on `arn:aws:s3:::YOUR_BUCKET`

CORS for streaming (tighten origin for prod):
```json
[ { "AllowedHeaders": ["*"], "AllowedMethods": ["GET"], "AllowedOrigins": ["*"] } ]
```

## API endpoints
- `POST /api/admin/upload` (multipart: audio, optional cover; fields: title, artist, album, duration)
- `GET /api/tracks?q=`
- `GET /api/tracks/:id`
- `GET /api/tracks/:id/stream` → `{ url }` (presigned)
