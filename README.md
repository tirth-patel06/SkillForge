🚀 Hustle Haveli – Project Structure

This repository contains the initial setup for the Hustle Haveli project, including both the frontend (client) and backend (server) environments.

📁 Folder Structure
hustle-haveli/
│
├── client/          # Frontend (Next.js + TypeScript)
│   ├── public/
│   ├── src/
│   │   ├── app/     # App Router pages
│   │   ├── components/
│   │   ├── utils/
│   │   └── types/
│   ├── package.json
│   └── tsconfig.json
│
├── server/          # Backend (Express + TypeScript)
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middlewares/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── utils/
│   │   ├── types/
│   │   ├── app.ts     # Express application setup
│   │   └── server.ts  # Server entry file
│   ├── package.json
│   └── tsconfig.json
│
└── docs/             # Documentation folder (empty for now)

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