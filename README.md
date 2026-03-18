# Menu-System

**Bharosa Cafe – Menu & Order Management Backend**

A comprehensive **real-time backend API** for managing restaurant menus and orders. The system supports **multi-branch restaurant operations**, **role-based staff management**, **dynamic menus**, **order processing**, **invoicing**, and **payments**.

It also uses **WebSockets and Redis** to provide **live order status tracking and kitchen updates**.

---

# Tech Stack

**Runtime**

* Node.js

**Web Framework**

* Express.js

**Database & ORM**

* PostgreSQL
* Prisma ORM

**Real-Time Communication**

* WebSockets (`ws`)
* Redis (Pub/Sub)

**Authentication & Security**

* JWT (JSON Web Tokens)
* bcrypt (password hashing)
* helmet
* express-rate-limit

**Validation**

* Zod

**Cloud Storage**

* AWS S3 (`@aws-sdk/client-s3`) for menu item image uploads

**Logging**

* Winston

---

# Clone and Setup

Follow these steps to run the project locally.

## 1. Clone the Repository

```bash
git clone <your-repo-url>
cd <repository-directory-name>
```

## 2. Navigate to Backend

```bash
cd backend
```

## 3. Install Dependencies

```bash
npm install
```

---

# Environment Variables

Create a `.env` file inside the **backend root folder**.

```env
PORT=3000
NODE_ENV=development

DATABASE_URL="postgresql://<user>:<password>@localhost:5432/<db_name>?schema=public"

REDIS_URL="redis://localhost:6379"

JWT_SECRET="your_highly_secure_jwt_secret"

ACCESS_TOKEN_SECRET="feabb5cbf203597b817997333c88efacbd372b0e9c4197dea6e3d64df920512c97dbd9a40d11c91d78d55f44b6d4b21bb4fd251e092489587c674b33227e27b0"
REFRESH_TOKEN_SECRET="83585e90b82848fcdae0d94e030772a926e3880e0149d44ef03a50d65b9cfff7c3e67b568e7b50381a435c3a287482abd41db6c22a20b9e4b17549324df8309d"

# Optional
# AWS_ACCESS_KEY_ID=
# AWS_SECRET_ACCESS_KEY=
# AWS_REGION=
# AWS_S3_BUCKET=
```

---

# Database Setup

## Apply Database Migrations

Sync the Prisma schema with PostgreSQL.

```bash
npm run migrate
```

Alternative:

```bash
npx prisma migrate dev
```

---

## Seed the Database (Optional)

Add initial test data such as default users or menu categories.

```bash
npx prisma db seed
```

---

# Start Development Server

Run the server using **Nodemon** (auto-restart on file changes).

```bash
npm run dev
```

If everything is configured correctly, the server should log:

```
Database connected successfully
Redis connected successfully
```

---

# Prisma Studio (Optional)

Use Prisma’s GUI to inspect and edit database records.

```bash
npm run studio
```

---

If this repo is public, one practical improvement. Add **Features**, **API Modules**, and **Architecture** sections. Right now it reads like setup instructions, not a backend system description. Developers browsing GitHub care about what the system *does*, not only how to install it. Add those or people will skim it and leave.
