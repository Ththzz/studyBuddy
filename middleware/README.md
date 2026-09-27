# Study Buddy AI middleware

This local Node service keeps the Dotblue credential out of the Expo app. It accepts one study file in memory, extracts readable PDF/DOCX/TXT content (or forwards a supported image to the model), and returns validated Multiple Choice, Flashcards, or Q&A data. Uploads are not written to disk.

## Local setup

Run on macOS from the Study Buddy project folder:

```sh
cp middleware/.env.example middleware/.env
npm --prefix middleware install
npm run api
```

Put the actual provider key only in `middleware/.env` as `AI_API_KEY`. The checked-in `.env.example` contains no credential. `AI_BASE_URL` and `AI_MODEL` are already set to the values supplied for this project.

Also set `SUPABASE_URL` and `SUPABASE_PUBLISHABLE_KEY` in `middleware/.env`. The middleware uses them to validate the signed-in user's Bearer token before it sends any request to the AI provider. Do not use a Supabase service-role or secret key here.

In the Expo project's root `.env.local`, set `EXPO_PUBLIC_STUDY_API_URL` to the middleware address. iOS Simulator can normally use `http://127.0.0.1:3001`; Android Emulator uses `http://10.0.2.2:3001`. For a physical phone, use the computer's private LAN IP and set `STUDY_API_HOST=0.0.0.0` in `middleware/.env` while both devices are on a trusted private network.

The server binds to `127.0.0.1` by default. AI routes require a valid Supabase access token and have a small in-memory rate limit per signed-in user. For production hosting, set `NODE_ENV=production`; the server then binds to `0.0.0.0` and honors the hosting platform's `PORT` variable. HTTPS must be terminated by the hosting platform or reverse proxy.

## Render deployment preparation

The repository-root `render.yaml` defines one Render web service for this middleware. It builds from `middleware/`, starts with `npm start`, and uses `/health` as its health check. The service is configured for the Singapore region and a single free instance; keep it at one instance because the rate limiter is stored in that instance's memory.

When creating the Blueprint, Render prompts for `AI_API_KEY`, `SUPABASE_URL`, and `SUPABASE_PUBLISHABLE_KEY`. Enter the existing values from the local environment settings in the Render Dashboard only. They are intentionally omitted from `render.yaml` and must never be committed. Render supplies `PORT`; do not add a fixed production port or `STUDY_API_HOST`.

Automatic deploys are disabled. After the service is created and verified, use a manual deploy from Render. Once it has a HTTPS `onrender.com` URL, update only the ignored root `.env.local` value of `EXPO_PUBLIC_STUDY_API_URL`, restart Expo, and test Generate and Q&A evaluation on a device.

## Endpoints

- `GET /health` — returns `{ "ok": true }` when this process is reachable. It does not disclose configuration status or secrets.
- `POST /api/study/generate` — multipart fields `file`, `questionCount`, `difficulty`, and `questionType`.
- `POST /api/study/evaluate` — JSON fields `subjectName`, `question`, `referenceAnswer`, and `userAnswer`.

Supported files: text PDFs, DOCX, TXT, JPG, PNG, WebP, and GIF up to 12 MB. Image-only/scanned PDFs need OCR and currently return a clear error rather than generating from guessed content.
