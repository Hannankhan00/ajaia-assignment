# Google Docs Clone

A minimal, fast Google Docs clone with rich-text editing, document sharing, and text file uploads.

## Tech Stack
- **Framework**: Next.js (App Router)
- **Database ORM**: Prisma
- **Database**: PostgreSQL
- **Styling**: Tailwind CSS v4
- **Editor**: Tiptap (Rich Text Editor)

## Local Setup

1. **Environment Variables**
   Create a `.env` file in the root directory and add your Postgres connection string:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/dbname"
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Initialize Database**
   ```bash
   npx prisma db push
   ```

4. **Run Development Server**
   ```bash
   npm run dev
   ```

## How to Test
1. Start the application and navigate to `http://localhost:3000`.
2. **Demo Accounts**: You can use these pre-seeded accounts to test:
   - Account A: `8hannankhan0@gmail.com` | Password: `qwerty1234`
   - Account B: `9hannankhan00@gmail.com` | Password: `qwerty1234`
3. Log into both accounts in different browsers (or incognito) to test sharing functionality.
4. Create a document with User A, share it with User B's email, and verify User B can access and edit it.

## Supported File Uploads
- File uploads are strictly limited to **`.txt`** and **`.md`** files only.

## Live Deployment
Live URL: https://ajaia-assignment-jet.vercel.app/
