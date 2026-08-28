# Login Page Website

A server-backed website with account creation, login, and a protected section.

## Files

- `index.html` - login, account creation, and protected content views
- `styles.css` - page styles
- `script.js` - frontend API calls and form behavior
- `server.js` - account API, password hashing, Supabase queries, sessions, and static file server
- `package.json` - server startup script
- `schema.sql` - Supabase tables and security configuration
- `.env.example` - required local environment variables

## Run Locally

Create a Supabase project, open its SQL Editor, and run the contents of `schema.sql`. Then copy `.env.example` to `.env` and fill in the project URL and **server-only** service-role key from Supabase settings.

Install Node.js 20 or newer, install dependencies, then run:

```text
npm install
npm start
```

Open `http://localhost:3000` in a browser. Do not open `index.html` directly, because the API requires the server.

## Create an Account

Select **Create an account**, enter an email address, and choose a password of at least 8 characters. Passwords are hashed with Node's built-in `scrypt` before being stored in Supabase. Login sessions are stored in Supabase as hashes of random tokens and sent to the browser in an `HttpOnly` cookie.

## Note

Never put `SUPABASE_SERVICE_ROLE_KEY` in frontend code or commit `.env`. The service-role key bypasses Supabase Row Level Security and belongs only on the Node server. For a public production deployment, add HTTPS, rate limiting, email verification, password reset, monitoring, backups, and a secret-managed process environment. The app sets `Secure` cookies automatically when `NODE_ENV=production`.
