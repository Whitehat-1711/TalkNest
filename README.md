# Full Stack Realtime Chat App

### Environment Setup

Create `backend/.env` from `backend/.env.example`:

```bash
PORT=5001
MONGODB_URI=...
JWT_SECRET=...

CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...

NODE_ENV=production
CORS_ORIGIN=http://51.21.169.27
COOKIE_SAME_SITE=lax
COOKIE_SECURE=false
```

Create `frontend/.env` from `frontend/.env.example`:

```bash
VITE_API_BASE_URL=http://51.21.169.27:5001/api
VITE_SERVER_BASE_URL=http://51.21.169.27:5001
```

If frontend and backend are on different domains, set `COOKIE_SAME_SITE=none` and `COOKIE_SECURE=true`.

### Build the App

```bash
npm run build
```

### Start the App

```bash
npm start
```

### CI/CD Webhook Test

This line is used to verify Jenkins auto-deploy from GitHub webhook.
