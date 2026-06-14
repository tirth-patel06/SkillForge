# SkillForge

A comprehensive full-stack platform for mentorship, task management, and collaborative learning. Built with modern web technologies, Hustle Haveli connects mentors and students through task assignments, peer reviews, and contribution tracking.

## 👥 Team Members

1. **Tirth Patel** - 20244125
2. **Anushka Gupta** - 20244032
3. **Shreya Saxena** - 20244153
4. **Aditya Kanodia** - 20244012

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [Project Modules](#project-modules)
- [Key Features by Role](#key-features-by-role)
- [Contributing](#contributing)
- [License](#license)

## ✨ Features

### Core Features
- **User Authentication**: Secure Email/Password authentication with OTP verification
- **Role-Based Access Control**: Student, Mentor, and Admin roles with specific permissions
- **Task Management**: Create, assign, and track tasks with difficulty levels and deadlines
- **Contribution System**: Earn points and track activity across tasks, reviews, and comments
- **Submission & Review System**: Submit solutions and receive feedback from mentors
- **Referral System**: Earn rewards through student referrals with admin approval
- **Mentor Profiles**: Detailed mentor profiles with expertise areas and student count
- **Task Comments**: Nested comments on tasks for discussions and feedback
- **PDF Generation**: Generate task submissions and reports as PDFs
- **File Upload**: Secure file uploads via Cloudinary integration

### Advanced Features
- **Analytics Dashboard**: Track progress and performance metrics
- **Admin Dashboard**: Manage users, tasks, and referrals
- **Critical Issue Tracking**: Flag and resolve task-related issues

## 🛠 Tech Stack

### Frontend
- **Next.js**: React framework with App Router
- **React 19**: UI library
- **TypeScript**: Type-safe code
- **Tailwind CSS 4**: Utility-first CSS framework
- **Axios**: HTTP client for API calls
- **Lucide React**: Icon library
- **ESLint**: Code quality and linting

### Backend
- **Node.js + Express.js**: Web server framework
- **TypeScript**: Type-safe backend code
- **MongoDB + Mongoose**: NoSQL database and ODM
- **JWT**: Token-based authentication
- **Bcrypt**: Password hashing
- **Cloudinary**: Cloud storage for file uploads
- **PDFKit**: PDF generation
- **Nodemailer / Brevo**: Email sending
- **Multer**: File upload middleware
- **Morgan**: HTTP request logging
- **Helmet**: HTTP security headers
- **Compression**: Response compression
- **Cookie Parser**: Cookie handling

### Development Tools
- **Nodemon**: Auto-restart on file changes
- **ts-node-dev**: TypeScript development server
- **ESLint**: Code linting
- **TypeScript Compiler**: Type checking

## 📁 Project Structure

```text
hustle-haveli/
├── client/                 # Next.js frontend application
│   ├── src/
│   │   ├── app/           # App Router pages and layouts
│   │   │   ├── admin/     # Admin dashboard pages
│   │   │   ├── auth/      # Authentication pages
│   │   │   ├── dashboard/ # Dashboard pages
│   │   │   ├── mentor/    # Mentor-specific pages
│   │   │   └── student/   # Student-specific pages
│   │   ├── components/    # Reusable React components
│   │   ├── context/       # React context (Auth, etc.)
│   │   ├── hooks/         # Custom React hooks
│   │   ├── lib/          # Utility functions (API clients)
│   │   ├── api/          # API call functions
│   │   └── types/        # TypeScript type definitions
│   ├── public/           # Static assets
│   └── package.json
│
├── server/               # Express.js backend application
│   ├── src/
│   │   ├── app.ts       # Express app setup
│   │   ├── server.ts    # Server entry point
│   │   ├── config.ts    # Main configuration
│   │   ├── config/      # Configuration files
│   │   │   ├── db.ts    # MongoDB connection
│   │   │   └── cloudinary.ts # Cloudinary config
│   │   ├── controllers/ # Request handlers
│   │   ├── models/      # MongoDB Mongoose models
│   │   │   ├── Contribution.ts
│   │   │   ├── MentorProfile.ts
│   │   │   ├── MentorSystem.ts
│   │   │   ├── Notification.ts
│   │   │   ├── Referral.ts
│   │   │   ├── StudentProfile.ts
│   │   │   ├── Task.ts
│   │   │   ├── TaskComment.ts
│   │   │   └── User.ts
│   │   ├── routes/      # API route definitions
│   │   ├── middleware/  # Express middleware
│   │   ├── lib/         # Utility functions
│   │   ├── types/       # TypeScript types
│   │   └── utils/       # Helper utilities
│   │       ├── createJwt.ts
│   │       └── generatePdf.ts
│   └── package.json
│
└── package.json        # Root package.json
```

## 📦 Key Database Models

### User
- Stores user account information
- Roles: STUDENT, MENTOR, ADMIN
- Supports email authentication with OTP-based verification

### Task
- Created by mentors for students to complete
- Statuses: PENDING, ACTIVE, APPROVED, REJECTED, REMOVED
- Includes difficulty levels, tech stack, and deadlines

### StudentProfile
- Extended student information
- Tracks completed tasks and referral status

### MentorProfile
- Mentor expertise and bio
- Tracks mentored students and system status

### Submission
- Student task submissions with solutions
- Supports multiple submission attempts
- Tracks approval status and feedback

### TaskComment
- Nested comments on tasks
- Discussion and feedback tracking

### Contribution
- Tracks user contributions and activity points
- Types: TASK, REVIEW, COMMENT, MESSAGE

### Referral
- Student referral tracking for rewards
- Admin approval workflow

### Notification
- User notifications and alerts
- Event-driven notifications

## 🚀 Prerequisites

- **Node.js**: v20.0 or higher recommended
- **npm**: v9.0 or higher
- **MongoDB**: v6.0 or higher (local or cloud)
- **Git**: For cloning the repository

### External Services Required
- **Cloudinary**: For file uploads (https://cloudinary.com)
- **Email Service**: For sending notifications (Brevo/SendGrid/Gmail)

## 📥 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/anushkagupta-06/hustle-haveli.git
cd hustle-haveli
```

### 2. Install Dependencies

Install server dependencies:
```bash
cd server
npm install
cd ..
```

Install client dependencies:
```bash
cd client
npm install
cd ..
```

## ⚙️ Configuration

### Server Configuration

Create a `.env` file in the `server` directory:

```env
# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/hustle-haveli
DB_NAME=hustle-haveli

# Authentication
JWT_SECRET=your_jwt_secret_key_here_minimum_32_characters
JWT_EXPIRY=7d

# Cloudinary (for file uploads)
CLOUDINARY_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Email Service
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
SENDER_EMAIL=noreply@hustlehaveli.com

# Server
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

### Client Configuration

Create a `.env` file in the `client` directory:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## 🏃 Running the Application

### Development Mode

**Terminal 1 - Start the Backend Server**

```bash
cd server
npm run dev
```

The server will start on `http://localhost:3001`

**Terminal 2 - Start the Frontend Application**

```bash
cd client
npm run dev
```

The frontend will start on `http://localhost:3000`

### Health Check

After both services are running, verify the setup:

```bash
curl http://localhost:3001/api/health
# Expected response: {"status":"ok"}
```

### Production Build

**Backend:**
```bash
cd server
npm run build
npm start
```

**Frontend:**
```bash
cd client
npm run build
npm start
```

## 📚 API Documentation

### Base URL
- Development: `http://localhost:3001/api`
- Production: `https://your-domain.com/api`

### Main Endpoints Categories
- `/api/auth` - Authentication & Registration
- `/api/mentors` - Mentor Management
- `/api/students` - Student Profiles
- `/api/tasks` - Task Management
- `/api/submissions` - Task Submissions
- `/api/referrals` - Referral Program
- `/api/comments` - Task Comments
- `/api/contributions` - User Contributions & Points
- `/api/admin/tasks` - Admin Task Approvals
- `/api/admin/referrals` - Admin Referral Approvals

## 🎯 Project Modules

### Authentication System
- Multi-factor authentication support
- JWT-based session management
- Email verification with OTP
- Password hashing with bcrypt

### Task Management
- Hierarchical task creation and management
- Task status workflow
- Difficulty-based filtering (EASY, MEDIUM, HARD)
- Deadline tracking
- Critical issue resolution

### Submission & Review
- Multi-submission support
- PDF export of submissions
- Mentor feedback system
- Approval workflow
- Comment system for feedback

### Referral Program
- Student referral tracking
- Admin approval system
- Reward calculation
- Referral history and statistics

### Admin Dashboard
- User management
- Task approval workflow
- Referral approval
- Analytics and reporting

### Contribution Tracking
- Point-based contribution tracking
- Recognizing valuable actions (Tasks, Reviews, Comments)

## 👥 Key Features by Role

### Student
- Browse available tasks
- Create project submissions
- Receive feedback from mentors
- Track progress and achievements
- Earn rewards through referrals
- Track contributions and points

### Mentor
- Create and manage tasks
- Assign tasks to students
- Review submissions and provide feedback
- Manage mentee profiles
- Track mentoring statistics

### Admin
- Manage users and roles
- Approve/reject tasks
- Manage referral program
- View platform analytics
- Moderate content

## 🔐 Security Features

- **Password Hashing**: Bcrypt with salt rounds
- **JWT Authentication**: Secure token-based auth with expiry
- **CORS Protection**: Configured allowed origins
- **Helmet.js**: HTTP header security
- **Input Validation**: Server-side validation
- **Rate Limiting**: Prevents abuse
- **Role-Based Authorization**: Middleware-based access control
- **Secure Cookies**: HttpOnly and SameSite flags

## 📝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License - see the LICENSE file for details.
