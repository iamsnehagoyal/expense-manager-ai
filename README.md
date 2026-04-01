# 💸 AI Expense Manager

A full-stack AI-powered invoice and expense management app built with:
- **Frontend:** React + Vite + TypeScript + Tailwind CSS
- **Backend:** Node.js + Express + TypeScript
- **Database:** MySQL + Prisma ORM
- **AI:** OpenAI GPT-4o Vision (invoice extraction)

---

## ✅ Prerequisites

Make sure these are installed on your machine:

| Tool | Version | Download |
|------|---------|----------|
| Node.js | v18+ | https://nodejs.org |
| MySQL | v8+ | https://dev.mysql.com/downloads/mysql/ |
| npm | v9+ | comes with Node |

---

## 🚀 Setup Instructions

### Step 1 — Create MySQL Database

Open your terminal and run:

```bash
mysql -u root -p
```

Then inside MySQL:

```sql
CREATE DATABASE expense_manager;
EXIT;
```

---

### Step 2 — Clone / Unzip the Project

Unzip the project folder and open it in your terminal:

```bash
cd ai-expense-manager
```

---

### Step 3 — Set Up Server Environment Variables

```bash
cd server
cp .env.example .env
```

Open `server/.env` and fill in your values:

```env
DATABASE_URL="mysql://root:YOUR_PASSWORD@localhost:3306/expense_manager"
JWT_SECRET="any-random-long-string-here"
OPENAI_API_KEY="sk-..."
PORT=5001
```

> Get your OpenAI API key from: https://platform.openai.com/api-keys

---

### Step 4 — Set Up Client Environment Variables

```bash
cd ../client
```

Create a file `client/.env`:

```env
VITE_API_URL=http://localhost:5001
```

---

### Step 5 — Install All Dependencies

From the root folder:

```bash
cd ..
npm run install:all
```

This installs dependencies for root, client, and server.

---

### Step 6 — Run Database Migrations

```bash
cd server
npx prisma generate
npx prisma migrate dev --name init
```

---

### Step 7 — Seed Demo Data (Optional)

```bash
npx ts-node src/seed.ts
```

This creates a demo account:
- **Email:** sneha@demo.com
- **Password:** password123

---

### Step 8 — Start the App

Go back to root and run:

```bash
cd ..
npm run dev
```

This starts both frontend and backend simultaneously.

| Service | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:5001 |

---

## 📁 Project Structure

```
ai-expense-manager/
├── client/                  # React frontend
│   ├── src/
│   │   ├── pages/           # Dashboard, Invoices, Upload, Budgets, Login, Register
│   │   ├── components/      # Layout, Sidebar
│   │   ├── context/         # Auth context
│   │   └── lib/             # Axios API instance
│   └── ...
├── server/                  # Express backend
│   ├── src/
│   │   ├── routes/          # auth, invoices, dashboard, budgets
│   │   ├── middleware/       # auth, errorHandler
│   │   ├── lib/             # Prisma client
│   │   └── seed.ts          # Demo data seeder
│   ├── prisma/
│   │   └── schema.prisma    # Database schema
│   └── ...
└── package.json             # Root scripts
```

---

## 🤖 How AI Extraction Works

1. Upload an invoice image (JPG/PNG)
2. The image is sent to OpenAI GPT-4o Vision
3. AI extracts: vendor, date, amount, category, line items
4. You review and edit the extracted data
5. Click Save to store in MySQL

---

## 🔧 Troubleshooting

**MySQL connection error:**
- Make sure MySQL is running: `brew services start mysql` (Mac) or `net start MySQL80` (Windows)
- Double-check your password in `.env`

**Prisma migration error:**
- Make sure the `expense_manager` database exists in MySQL
- Run `npx prisma generate` before `migrate dev`

**OpenAI error:**
- Make sure your API key is valid and has credits
- GPT-4o Vision is required — check your plan at platform.openai.com

**Port already in use:**
- Change `PORT=5001` in `server/.env`
- Change `server: { port: 5174 }` in `client/vite.config.ts`
