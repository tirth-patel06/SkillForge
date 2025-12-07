🚀 Hustle Haveli – Project Structure

This repository contains the initial setup for the Hustle Haveli project, including both the frontend (client) and backend (server) environments.

## 📁 Folder Structure

```
HUSTLE-HAVELI/
│
├── client/
│   ├── .next/
│   ├── node_modules/
│   ├── public/
│   ├── src/
│   │   ├── api/
│   │   │   └── auth.ts
│   │   ├── app/
│   │   │   ├── auth/
│   │   │   │   └── page.tsx
│   │   │   ├── dashboard/
│   │   │   │   └── page.tsx
│   │   │   ├── github-callback/
│   │   │   │   └── page.tsx
│   │   │   ├── globals.css
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx
│   │   ├── providers.tsx
│   │   ├── components/
│   │   │   ├── Dashboard.tsx
│   │   │   ├── GuestRoute.tsx
│   │   │   └── ProtectedRoute.tsx
│   │   ├── context/
│   │   │   └── AuthContext.tsx
│   │   └── pages/
│   │       ├── AuthPage.tsx
│   │       └── GithubCallback.tsx
│   ├── .env
│   ├── .gitignore
│   ├── eslint.config.mjs
│   ├── next-env.d.ts
│   ├── next.config.ts
│   ├── package.json
│   ├── package-lock.json
│   ├── postcss.config.mjs
│   └── README.md
│
├── server/
│   ├── node_modules/
│   ├── src/
│   │   ├── config/
│   │   │   ├── db.ts
│   │   │   └── passportGithub.ts
│   │   ├── controllers/
│   │   │   ├── authController.ts
│   │   │   ├── mentorController.ts
│   │   │   └── taskController.ts
│   │   ├── lib/
│   │   │   ├── mongoose.ts
│   │   │   └── sendEmail.ts
│   │   ├── middleware/
│   │   │   ├── auth.ts
│   │   │   └── requireMentor.ts
│   │   ├── models/
│   │   │   ├── MentorSystem.ts
│   │   │   ├── Referral.ts
│   │   │   ├── Task.ts
│   │   │   └── User.ts
│   │   ├── routes/
│   │   │   ├── authRoutes.ts
│   │   │   └── mentorRoutes.ts
│   │   ├── types/
│   │   │   ├── auth.ts
│   │   │   ├── app.ts
│   │   │   └── server.ts
│   │   └── server.ts
│   ├── .env
│   ├── package.json
│   ├── package-lock.json
│   ├── tsconfig.json
│   ├── .gitignore
│   └── README.md
│
├── package.json
├── README.md
└── .gitignore
```


🛠️ Tech Stack
Frontend (client/)

Next.js

TypeScript

Tailwind CSS

ESLint

Node.js (runtime)

Backend (server/)

Node.js

Express.js

TypeScript

MongoDB (Mongoose)

Nodemon / ts-node-dev (development)

⚙️ Getting Started
Install dependencies
Client:
cd client
npm install
npm run dev

Server:
cd server
npm install
npm run dev
