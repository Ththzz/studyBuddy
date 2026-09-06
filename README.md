# Study Buddy

This Expo project targets iOS and Android mobile apps.

## Local environment

Create a local environment file from the checked-in template:

```sh
cp .env.example .env.local
```

Open `.env.local` and replace the placeholder values with the Supabase project
URL and client key for your local project. These variables are prepared for a
future Supabase integration; the current mobile screens do not connect to
Supabase yet. Start Expo from the project folder after saving the file:

```sh
npx expo start
```

The template currently defines these variables:

| Variable | Purpose |
| --- | --- |
| `EXPO_PUBLIC_SUPABASE_URL` | Supabase project URL reserved for the future mobile integration. |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous client key reserved for the future mobile integration. Keep Row Level Security enabled for every protected table. |

## Secret handling

Every variable whose name starts with `EXPO_PUBLIC_` is bundled into the
mobile client and can be read by anyone who has the app. Treat these values as
public configuration, even when they are loaded from `.env.local` during local
development.

Never put a Supabase `service_role` key, private key, password, access token,
refresh token, API secret, or other credential in the mobile app or in an
`EXPO_PUBLIC_*` variable. Keep those values on a trusted server or server-side
function and call that service from the app when privileged work is required.

Do not commit `.env.local` or any file containing real credentials. If a secret
is exposed, revoke or rotate it immediately and remove it from the client.
