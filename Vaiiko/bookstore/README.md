# Bookstore

A full-stack web application built with **Next.js**, **React**, and **Prisma**, featuring JWT-based authentication and secure password hashing.

---

## Tech Stack

### Core

* **Next.js** – React framework for production
* **React** – UI library
* **Prisma** – Type-safe ORM
* **Node.js** – Runtime

### Authentication & Utilities

* **jsonwebtoken** – JWT authentication
* **bcrypt** – Password hashing
* **formidable** – Form/data parsing

### Tooling

* **ESLint** – Code linting
* **Babel React Compiler** – React optimizations

---

## Package Versions

* next: `16.0.6`
* react: `19.2.0`
* react-dom: `19.2.0`
* prisma: `6.19.0`
* @prisma/client: `6.19.0`
* bcrypt: `6.0.0`
* jsonwebtoken: `9.0.2`
* formidable: `3.5.4`
* eslint: `9.39.1`
* eslint-config-next: `16.0.6`
* babel-plugin-react-compiler: `1.0.0`

---

## Getting Started

### 1. Install Dependencies

```bash
npm install
# or
yarn install
# or
pnpm install
```

---

### 2. Environment Variables

Create a `.env` file in the root of the project:

```env
DATABASE_URL="database_link_here_with_username_and_password"
JWT_SECRET="your_jwt_secret_string_here"
```

#### Required Variables

* **DATABASE_URL** – Database connection string (must include username and password)
* **JWT_SECRET** – Secret string used to sign and verify JWT tokens

⚠️ Do **NOT** commit your `.env` file to version control.

---

## Prisma Setup

### Generate Prisma Client

```bash
npx prisma generate
```

### Run Database Migrations

```bash
npx prisma migrate dev
```

### Open Prisma Studio

```bash
npx prisma studio
```

---

## Running the Application

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build

```bash
npm run build
npm run start
```

---

## Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

---

## Authentication Notes

* Passwords are hashed using **bcrypt** before storage
* Authentication uses **JWT** tokens signed with `JWT_SECRET`
* Tokens should be stored securely (HTTP-only cookies recommended)

---

## Deployment

When deploying, make sure the following environment variables are set:

* `DATABASE_URL`
* `JWT_SECRET`

The application is compatible with platforms such as **Vercel**, **Railway**, or **Docker-based** deployments.

---

## License


