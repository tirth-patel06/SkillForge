# Hustle Haveli

A comprehensive full-stack platform for mentorship, task management, and collaborative learning. Built with modern web technologies, Hustle Haveli connects mentors and students through real-time task assignments, peer reviews, and team collaboration features.

## 👥 Team Members

1. **Anushka Gupta** - 20244032
2. **Aditya Kanodia** - 20244012
3. **Tirth Patel** - 20244125
4. **Shreya Saxena** - 20244153

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
- **User Authentication**: GitHub OAuth2 + Email/Password authentication
- **Role-Based Access Control**: Student, Mentor, and Admin roles with specific permissions
- **Task Management**: Create, assign, and track tasks with difficulty levels and deadlines
- **Real-Time Communication**: WebSocket-based chat system for team collaboration
- **Submission & Review System**: Submit solutions and receive feedback from mentors
- **Referral System**: Earn rewards through student referrals with admin approval
- **Mentor Profiles**: Detailed mentor profiles with expertise areas and student count
- **Task Comments**: Nested comments on tasks for discussions and feedback
- **PDF Generation**: Generate task submissions and reports as PDFs
- **File Upload**: Secure file uploads via Cloudinary integration

### Advanced Features
- **Analytics Dashboard**: Track progress and performance metrics
- **Admin Dashboard**: Manage users, tasks, and referrals
- **Real-Time Notifications**: Get instant updates on task assignments and submissions
- **Team Collaboration**: Create and manage teams for group projects
- **Critical Issue Tracking**: Flag and resolve task-related issues

## 🛠 Tech Stack

### Frontend
- **Next.js 16**: React framework with App Router
- **React 19**: UI library
- **TypeScript**: Type-safe code
- **Tailwind CSS 4**: Utility-first CSS framework
- **Socket.io Client**: Real-time communication
- **Axios**: HTTP client for API calls
- **Lucide React**: Icon library
- **ESLint**: Code quality and linting

### Backend
- **Node.js + Express.js**: Web server framework
- **TypeScript**: Type-safe backend code
- **MongoDB + Mongoose**: NoSQL database and ODM
- **Socket.io**: Real-time bidirectional communication
- **Passport.js**: Authentication strategy (GitHub OAuth)
- **JWT**: Token-based authentication
- **Bcrypt**: Password hashing
- **Cloudinary**: Cloud storage for file uploads
- **PDFKit**: PDF generation
- **Nodemailer**: Email sending
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

```
hustle-haveli/
├── client/                 # Next.js frontend application
│   ├── src/
│   │   ├── app/           # App Router pages and layouts
│   │   │   ├── admin/     # Admin dashboard pages
│   │   │   ├── auth/      # Authentication pages
│   │   │   ├── dashboard/ # Dashboard pages
│   │   │   ├── mentor/    # Mentor-specific pages
│   │   │   ├── student/   # Student-specific pages
│   │   │   └── github-callback/ # OAuth callback
│   │   ├── components/    # Reusable React components
│   │   │   ├── AttentionRequired.tsx
│   │   │   ├── Dashboard.tsx
│   │   │   ├── GuestRoute.tsx
│   │   │   ├── LandingPage.tsx
│   │   │   ├── MentorLayout.tsx
│   │   │   ├── MyTasks.tsx
│   │   │   ├── ProtectedRoute.tsx
│   │   │   ├── ReferralSystem.tsx
│   │   │   ├── ResolvedHistory.tsx
│   │   │   ├── SubmissionReview.tsx
│   │   │   ├── TaskComments.tsx
│   │   │   ├── TaskCreation.tsx
│   │   │   ├── TaskDetailPage.tsx
│   │   │   └── TeamChat.tsx
│   │   ├── context/       # React context (Auth, etc.)
│   │   │   └── AuthContext.tsx
│   │   ├── lib/          # Utility functions (API, Socket)
│   │   │   ├── api.ts
│   │   │   └── socket.ts
│   │   ├── api/          # API call functions
│   │   │   ├── auth.ts
│   │   │   ├── chat.ts
│   │   │   ├── studentTasks.ts
│   │   │   └── team.ts
│   │   └── types/        # TypeScript type definitions
│   │       ├── mentorProfile.ts
│   │       ├── studentProfile.ts
│   │       └── team.ts
│   ├── public/           # Static assets
│   └── package.json
│
├── server/               # Express.js backend application
│   ├── src/
│   │   ├── app.ts       # Express app setup
│   │   ├── server.ts    # Server entry point
│   │   ├── socket.ts    # WebSocket configuration
│   │   ├── config.ts    # Main configuration
│   │   ├── config/      # Configuration files
│   │   │   ├── db.ts    # MongoDB connection
│   │   │   ├── cloudinary.ts # Cloudinary config
│   │   │   └── passportGithub.ts # GitHub OAuth config
│   │   ├── controllers/ # Request handlers
│   │   │   ├── adminReferralApproval.ts
│   │   │   ├── adminTaskApprove.ts
│   │   │   ├── authController.ts
│   │   │   ├── commentController.ts
│   │   │   ├── mentorController.ts
│   │   │   ├── mentorProfileController.ts
│   │   │   ├── referralController.ts
│   │   │   ├── studentController.ts
│   │   │   ├── studentProfileController.ts
│   │   │   ├── submissionController.ts
│   │   │   ├── taskController.ts
│   │   │   ├── teamController.ts
│   │   │   └── uploadController.ts
│   │   ├── models/      # MongoDB Mongoose models
│   │   │   ├── ChatMessage.ts
│   │   │   ├── MentorProfile.ts
│   │   │   ├── MentorSystem.ts
│   │   │   ├── Notification.ts
│   │   │   ├── Referral.ts
│   │   │   ├── StudentProfile.ts
│   │   │   ├── Task.ts
│   │   │   ├── TaskComment.ts
│   │   │   ├── Team.ts
│   │   │   └── User.ts
│   │   ├── routes/      # API route definitions
│   │   │   ├── analytics.ts
│   │   │   ├── auth.ts
│   │   │   ├── authRoutes.ts
│   │   │   ├── chatRoutes.ts
│   │   │   ├── commentRoutes.ts
│   │   │   ├── mentorRoutes.ts
│   │   │   ├── referral.ts
│   │   │   ├── referralRoutes.ts
│   │   │   ├── studentRoutes.ts
│   │   │   ├── studentTaskRoutes.ts
│   │   │   ├── submissionRoutes.ts
│   │   │   ├── task.ts
│   │   │   ├── taskRoutes.ts
│   │   │   └── teamRoutes.ts
│   │   ├── middleware/  # Express middleware
│   │   │   ├── auth.ts
│   │   │   ├── authMiddleware.ts
│   │   │   ├── requireAdmin.ts
│   │   │   ├── requireMentor.ts
│   │   │   ├── requireStudent.ts
│   │   │   └── upload.ts
│   │   ├── lib/         # Utility functions
│   │   │   ├── cloudinaryUpload.ts
│   │   │   ├── mongoose.ts
│   │   │   └── sendEmail.ts
│   │   ├── types/       # TypeScript types
│   │   │   └── auth.ts
│   │   └── utils/       # Helper utilities
│   │       ├── createJwt.ts
│   │       ├── generatePdf.ts
│   │       └── seed.ts
│   ├── public/          # Static files (referral docs, etc.)
│   │   └── referrals/
│   └── package.json
│
└── package.json        # Root package.json
```

## 📦 Key Database Models

### User
- Stores user account information
- Roles: STUDENT, MENTOR, ADMIN
- Supports GitHub OAuth and email authentication
- OTP-based email verification

### Task
- Created by mentors for students to complete
- Statuses: PENDING, ACTIVE, APPROVED, REJECTED, REMOVED
- Includes difficulty levels, tech stack, and deadlines
- Critical issue tracking

### StudentProfile
- Extended student information
- Tracks completed tasks, current team, referral status

### MentorProfile
- Mentor expertise and bio
- Tracks mentored students and system status

### Team
- Collaborative groups for multi-person tasks
- Member management and status tracking

### Submission
- Student task submissions with solutions
- Supports multiple submission attempts
- Tracks approval status and feedback

### TaskComment
- Nested comments on tasks
- Discussion and feedback tracking

### Referral
- Student referral tracking for rewards
- Admin approval workflow

### ChatMessage
- Real-time chat messages
- Team and group conversations

### Notification
- User notifications and alerts
- Event-driven notifications

## 🚀 Prerequisites

- **Node.js**: v18.0 or higher
- **npm**: v9.0 or higher
- **MongoDB**: v6.0 or higher (local or cloud)
- **Git**: For cloning the repository

### External Services Required
- **GitHub OAuth**: For GitHub login (https://github.com/settings/developers)
- **Cloudinary**: For file uploads (https://cloudinary.com)
- **Email Service**: For sending notifications (Gmail, SendGrid, etc.)

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

# GitHub OAuth
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
GITHUB_CALLBACK_URL=http://localhost:3001/api/auth/github/callback

# Cloudinary (for file uploads)
CLOUDINARY_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Email Service (Gmail example)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
SENDER_EMAIL=noreply@hustlehaveli.com

# Server
PORT=3001
NODE_ENV=development
```

### Client Configuration

Create a `.env` file in the `client` directory:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_SOCKET_URL=http://localhost:3001
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

### Authentication Endpoints
```
POST   /api/auth/register         - Register new user
POST   /api/auth/login            - Login with email/password
GET    /api/auth/github           - GitHub OAuth redirect
GET    /api/auth/github/callback  - GitHub OAuth callback
POST   /api/auth/logout           - Logout user
GET    /api/auth/me               - Get current user profile
POST   /api/auth/verify-email     - Verify email with OTP
```

### Task Endpoints
```
GET    /api/tasks                 - List all tasks
POST   /api/tasks                 - Create new task (mentor only)
GET    /api/tasks/:id             - Get task details
PUT    /api/tasks/:id             - Update task (mentor only)
DELETE /api/tasks/:id             - Delete task (mentor only)
PATCH  /api/tasks/:id/status      - Update task status (admin only)
```

### Student Endpoints
```
GET    /api/students/:id          - Get student profile
POST   /api/students/profile      - Create student profile
PUT    /api/students/profile      - Update student profile
GET    /api/students/:id/tasks    - Get student's tasks
```

### Mentor Endpoints
```
GET    /api/mentors               - List all mentors
GET    /api/mentors/:id           - Get mentor profile
POST   /api/mentors/profile       - Create mentor profile
PUT    /api/mentors/profile       - Update mentor profile
```

### Submission Endpoints
```
POST   /api/submissions           - Submit task solution
GET    /api/submissions/:id       - Get submission details
PUT    /api/submissions/:id/review - Review submission (mentor only)
GET    /api/submissions           - List submissions (filtered)
```

### Team Endpoints
```
POST   /api/teams                 - Create team
GET    /api/teams/:id             - Get team details
PUT    /api/teams/:id             - Update team
DELETE /api/teams/:id             - Delete team
POST   /api/teams/:id/members     - Add team member
DELETE /api/teams/:id/members/:memberId - Remove team member
```

### Chat Endpoints
```
POST   /api/chat/send             - Send message
GET    /api/chat/:teamId          - Get team chat history
GET    /api/chat/direct/:userId   - Get direct messages
```

### Referral Endpoints
```
POST   /api/referrals             - Create referral
GET    /api/referrals             - List referrals
GET    /api/referrals/status      - Get referral status
PATCH  /api/referrals/:id/approve - Approve referral (admin only)
```

### Real-Time Events (WebSocket)
```
chat:message           - Send/receive chat messages
task:updated          - Task status update
submission:reviewed    - Submission feedback
notification:new      - New notification
team:member-joined    - Team member joined
team:member-left      - Team member left
```

## 🎯 Project Modules

### Authentication System
- Multi-factor authentication support
- GitHub OAuth2 integration
- JWT-based session management
- Email verification with OTP
- Password hashing with bcrypt

### Task Management
- Hierarchical task creation and management
- Task status workflow (PENDING → ACTIVE → APPROVED)
- Difficulty-based filtering (EASY, MEDIUM, HARD)
- Tech stack tagging
- Deadline tracking
- Critical issue resolution

### Real-Time Chat
- WebSocket-based messaging
- Team communication
- One-on-one messaging
- Message history
- Notification support

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
- User management (CRUD operations)
- Task approval workflow
- Referral approval
- Analytics and reporting
- Content moderation

### Team Collaboration
- Create and manage teams
- Add/remove team members
- Shared task management
- Team-based submissions

## 👥 Key Features by Role

### Student
- Browse available tasks
- Create project submissions
- Join teams
- Receive feedback from mentors
- Track progress and achievements
- Earn rewards through referrals
- Participate in team chat

### Mentor
- Create and manage tasks
- Assign tasks to students
- Review submissions and provide feedback
- Manage mentee profiles
- Track mentoring statistics
- Generate performance reports
- Monitor team progress

### Admin
- Manage users and roles
- Approve/reject tasks
- Manage referral program
- View platform analytics
- Moderate content
- System configuration
- User ban/unban functionality

## 🔐 Security Features

- **Password Hashing**: Bcrypt with salt rounds
- **JWT Authentication**: Secure token-based auth with expiry
- **CORS Protection**: Configured allowed origins
- **Helmet.js**: HTTP header security
- **Input Validation**: Server-side validation
- **Rate Limiting**: Prevents abuse
- **Role-Based Authorization**: Middleware-based access control
- **Secure Cookies**: HttpOnly and SameSite flags
- **Environment Variables**: Sensitive data in .env files
- **MongoDB Injection Prevention**: Mongoose schema validation

## 🚀 Deployment

### Deployment Checklist
- [ ] Set up MongoDB Atlas cluster
- [ ] Configure environment variables
- [ ] Set up GitHub OAuth app
- [ ] Configure Cloudinary
- [ ] Set up email service
- [ ] Build both frontend and backend
- [ ] Deploy server (Heroku, Render, Railway, etc.)
- [ ] Deploy client (Vercel, Netlify, etc.)

### Recommended Platforms
- **Backend**: Render, Railway, Heroku, DigitalOcean
- **Frontend**: Vercel, Netlify, GitHub Pages
- **Database**: MongoDB Atlas
- **File Storage**: Cloudinary, AWS S3
- **Email**: SendGrid, Gmail SMTP

## 📝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Code Standards
- Follow TypeScript best practices
- Use meaningful variable and function names
- Add comments for complex logic
- Write ESLint-compliant code
- Test your changes before submitting

## 📄 License

This project is licensed under the ISC License - see the LICENSE file for details.

## 🙋 Support

For support, open an issue on the [GitHub Issues page](https://github.com/anushkagupta-06/hustle-haveli/issues).

## 🔗 Links

- **Repository**: [GitHub - hustle-haveli](https://github.com/anushkagupta-06/hustle-haveli)
- **Issues**: [Report Issues](https://github.com/anushkagupta-06/hustle-haveli/issues)
- **GitHub OAuth Setup**: [Developer Settings](https://github.com/settings/developers)
- **Cloudinary**: [Sign Up & Dashboard](https://cloudinary.com)
- **MongoDB Atlas**: [Cloud Database](https://www.mongodb.com/cloud)

---

**Made with ❤️ by the Eleven's squad Team**

*Last Updated: December 2025*
