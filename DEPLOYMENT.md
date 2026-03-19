# Deployment Guide: Restaurant Management System

This guide explains how to deploy your full-stack application (Next.js frontend + Express/Node.js backend).

## Prerequisites

- [Neon](https://neon.tech/) account (for PostgreSQL database).
- [Vercel](https://vercel.com/) account (for Frontend deployment).
- [Render](https://render.com/) or [Railway](https://railway.app/) account (for Backend deployment).
- [Upstash](https://upstash.com/) account (for serverless Redis).

---

## 1. Database Setup (Neon)

1. Log in to [Neon.tech](https://neon.tech/).
2. Create a new project and a database (e.g., `restaurant_db`).
3. Copy the **Connection String** (Direct connection or Pooled).
   - *Example:* `postgresql://user:password@ep-host.aws.neon.tech/neondb?sslmode=require`
4. Keep this string for the backend environment variables.

---

## 2. Backend Deployment (Render/Railway)

### Step 1: Prepare Environment Variables
You will need to set the following variables in your hosting provider's dashboard:

| Variable | Description |
| :--- | :--- |
| `DATABASE_URL` | Your Neon PostgreSQL connection string. |
| `ACCESS_TOKEN_SECRET` | A long random string for JWT access tokens. |
| `REFRESH_TOKEN_SECRET` | A long random string for JWT refresh tokens. |
| `PORT` | Set to `5000` (or leave default if the platform handles PORT). |
| `REDIS_URL` | Your Upstash Redis connection string (e.g., `redis://default:pass@host:port`). |
| `NODE_ENV` | Set to `production`. |

### Step 2: Build & Start Commands
- **Build Command:** `npm install && npx prisma generate`
- **Start Command:** `npm start`

### Step 3: Run Migrations
After deployment, you need to sync your database schema:
1. Open the terminal/shell of your hosting provider.
2. Run: `npx prisma migrate deploy`
3. (Optional) To seed initial data: `npm run seed`

---

## 3. Frontend Deployment (Vercel)

1. Connect your GitHub repository to [Vercel](https://vercel.com/).
2. Select the `frontend-v2` directory as the root.
3. Add the following **Environment Variable**:

| Variable | Value |
| :--- | :--- |
| `NEXT_PUBLIC_API_URL` | The URL of your deployed backend (e.g., `https://your-backend.onrender.com`). |

4. Click **Deploy**. Vercel will automatically detect the Next.js project and handle the build process.

---

## 4. Production Storage (Important)

> [!WARNING]
> Your current backend uses **local disk storage** for image uploads (`public/uploads`). Platforms like Render/Vercel have ephemeral filesystems, meaning **uploaded images will be deleted** every time the server restarts.

### Recommended Solution: AWS S3 or Cloudinary
To keep images permanently:
1. Set up an AWS S3 bucket or Cloudinary account.
2. Update `backend/src/controllers/media.controller.js` to use an S3 upload service (the `@aws-sdk/client-s3` dependency is already installed).

---

## 5. Summary Checklist

- [ ] Neon Database created and URL copied.
- [ ] Backend deployed with all environment variables.
- [ ] Prisma migrations executed (`npx prisma migrate deploy`).
- [ ] Redis instance created (Upstash) and URL added to Backend.
- [ ] Frontend deployed on Vercel with `NEXT_PUBLIC_API_URL` pointing to the Backend.
- [ ] Verified login and core functionality in production.
