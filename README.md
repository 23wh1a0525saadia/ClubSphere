# ClubSphere - Campus Club Event Management System

Complete MERN Stack Application for managing campus clubs and events.

## 📋 Project Overview

**ClubSphere** is a comprehensive platform designed to streamline the creation, management, and participation of college club events. It provides:

- **Club Management**: Create and manage campus clubs with role-based access
- **Event Management**: Organize and track club events  
- **Student Registration**: Easy event registration and attendance tracking
- **Announcements**: Share club news and updates
- **User Authentication**: Secure JWT-based authentication
- **Role-Based Access Control**: Student, Admin, and Club President roles

## 🏗️ Architecture

```
Frontend (React)          Backend (Node.js + Express)       Database (MongoDB)
├─ Auth Pages            ├─ API Routes                      ├─ Users
├─ Club Pages            ├─ Controllers                     ├─ Clubs
├─ Event Pages           ├─ Models                          ├─ Events
└─ Services              ├─ Middleware                      ├─ Registrations
                         └─ Config                          └─ Announcements
```

## 📊 Database Schema

### Collections

#### 1. **Users Collection**
```javascript
{
  _id: ObjectId,
  name: String,
  email: String (unique),
  password: String (hashed),
  role: "student" | "admin" | "president",
  registrationNumber: String,
  department: "CSE" | "ECE" | "ME" | "CE" | "EEE" | "BT" | "OTHER",
  semester: Number (1-8),
  clubsJoined: [ObjectId],
  eventsRegistered: [ObjectId],
  profileImage: String,
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

#### 2. **Clubs Collection**
```javascript
{
  _id: ObjectId,
  name: String (unique),
  description: String,
  president: ObjectId (ref: User),
  vicePrincipal: ObjectId,
  secretary: ObjectId,
  members: [ObjectId],
  category: "academic" | "cultural" | "sports" | "technical" | "social" | "professional",
  email: String,
  logo: String,
  coverImage: String,
  events: [ObjectId],
  announcements: [ObjectId],
  memberCount: Number,
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

#### 3. **Events Collection**
```javascript
{
  _id: ObjectId,
  title: String,
  description: String,
  club: ObjectId (ref: Club),
  banner: String,
  eventType: "workshop" | "seminar" | "competition" | "fest" | "social" | "technical" | "other",
  startDate: Date,
  endDate: Date,
  startTime: String,
  endTime: String,
  location: String,
  capacity: Number,
  registrations: [ObjectId],
  registrationCount: Number,
  isRegistrationOpen: Boolean,
  organizers: [ObjectId],
  status: "upcoming" | "ongoing" | "completed" | "cancelled",
  isFeatured: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

#### 4. **Registrations Collection**
```javascript
{
  _id: ObjectId,
  event: ObjectId (ref: Event),
  student: ObjectId (ref: User),
  club: ObjectId (ref: Club),
  registrationNumber: String,
  department: String,
  registeredAt: Date,
  status: "registered" | "attended" | "cancelled" | "no-show",
  attendance: Boolean,
  attendedAt: Date,
  feedback: String,
  rating: Number (0-5)
}
```

#### 5. **Announcements Collection**
```javascript
{
  _id: ObjectId,
  title: String,
  content: String,
  club: ObjectId (ref: Club),
  createdBy: ObjectId (ref: User),
  category: "general" | "event" | "recruitment" | "achievement" | "important",
  image: String,
  priority: "low" | "medium" | "high" | "urgent",
  isPinned: Boolean,
  views: Number,
  likes: [ObjectId],
  comments: [{
    user: ObjectId,
    text: String,
    createdAt: Date
  }],
  createdAt: Date,
  updatedAt: Date
}
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- Git

### Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create `.env` file** (use `.env.example` as reference)
   ```bash
   cp .env.example .env
   ```

4. **Update `.env` with your configuration**
   ```env
   PORT=5000
   NODE_ENV=development
   MONGODB_URI=mongodb://localhost:27017/clubsphere
   JWT_SECRET=your_secret_key_here
   FRONTEND_URL=http://localhost:3000
   ```

5. **Start MongoDB** (if running locally)
   ```bash
   mongod
   ```

6. **Run the server**
   ```bash
   npm run dev
   ```
   Server will start at `http://localhost:5000`

### Frontend Setup

1. **Navigate to frontend directory** (in a new terminal)
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create `.env` file**
   ```bash
   cp .env.example .env
   ```

4. **Update `.env` if needed**
   ```env
   REACT_APP_API_URL=http://localhost:5000/api
   ```

5. **Start the React app**
   ```bash
   npm start
   ```
   App will open at `http://localhost:3000`

## 📚 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (Protected)
- `PUT /api/auth/profile` - Update profile (Protected)
- `GET /api/auth/:id` - Get user by ID (Protected)
- `GET /api/auth` - Get all users (Admin only)

### Clubs
- `GET /api/clubs` - Get all clubs
- `GET /api/clubs/:id` - Get club details
- `POST /api/clubs` - Create club (Protected)
- `PUT /api/clubs/:id` - Update club (Protected)
- `DELETE /api/clubs/:id` - Delete club (Protected)
- `POST /api/clubs/:id/join` - Join club (Protected)
- `POST /api/clubs/:id/leave` - Leave club (Protected)

### Events
- `GET /api/events` - Get all events
- `GET /api/events/:id` - Get event details
- `GET /api/events/club/:clubId` - Get events by club
- `POST /api/events` - Create event (Protected)
- `PUT /api/events/:id` - Update event (Protected)
- `DELETE /api/events/:id` - Delete event (Protected)

### Registrations
- `POST /api/registrations/:eventId` - Register for event (Protected)
- `GET /api/registrations/me/registrations` - Get user's registrations (Protected)
- `GET /api/registrations/event/:eventId` - Get event registrations (Protected)
- `PUT /api/registrations/:registrationId/attendance` - Mark attendance (Protected)
- `DELETE /api/registrations/:registrationId` - Cancel registration (Protected)
- `PUT /api/registrations/:registrationId/feedback` - Submit feedback (Protected)

### Announcements
- `GET /api/announcements` - Get all announcements
- `GET /api/announcements/:id` - Get announcement details
- `POST /api/announcements` - Create announcement (Protected)
- `PUT /api/announcements/:id` - Update announcement (Protected)
- `DELETE /api/announcements/:id` - Delete announcement (Protected)
- `POST /api/announcements/:id/like` - Like announcement (Protected)
- `POST /api/announcements/:id/comment` - Add comment (Protected)

## 🔐 User Roles & Permissions

### Student
- Browse clubs and events
- Join/leave clubs
- Register for events
- View profile
- Submit feedback

### Club President
- Create and manage club
- Create events
- View announcements
- Mark attendance
- Manage members

### Admin
- Access all management features
- Create clubs
- Manage users
- View all data

## 🎨 Frontend Pages

- **Home** - Landing page with featured clubs and events
- **Login/Register** - Authentication pages
- **Clubs** - Browse and filter clubs by category
- **Events** - Browse and filter events by status
- **My Events** - View registered events (Protected)
- **Profile** - User profile management (Protected)
- **Dashboard** - Admin/President dashboard (Protected)

## 🛠️ Technology Stack

### Backend
- Node.js + Express.js
- MongoDB + Mongoose
- JWT Authentication
- bcryptjs (Password hashing)
- CORS
- dotenv

### Frontend
- React.js
- React Router v6
- Axios
- CSS3

## 📁 Project Structure

```
ClubSphere/
├── backend/
│   ├── config/
│   │   └── database.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── clubController.js
│   │   ├── eventController.js
│   │   ├── registrationController.js
│   │   └── announcementController.js
│   ├── middleware/
│   │   ├── authMiddleware.js
│   │   └── errorHandler.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Club.js
│   │   ├── Event.js
│   │   ├── Registration.js
│   │   └── Announcement.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── clubRoutes.js
│   │   ├── eventRoutes.js
│   │   ├── registrationRoutes.js
│   │   └── announcementRoutes.js
│   ├── .env.example
│   ├── .gitignore
│   ├── index.js
│   └── package.json
│
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.js
│   │   │   ├── Navbar.css
│   │   │   └── PrivateRoute.js
│   │   ├── context/
│   │   │   └── AuthContext.js
│   │   ├── pages/
│   │   │   ├── Home.js
│   │   │   ├── Home.css
│   │   │   ├── Login.js
│   │   │   ├── Register.js
│   │   │   ├── Auth.css
│   │   │   ├── Clubs.js
│   │   │   ├── Clubs.css
│   │   │   ├── Events.js
│   │   │   └── Events.css
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── styles/
│   │   │   └── global.css
│   │   ├── App.js
│   │   └── index.js
│   ├── .env.example
│   ├── .gitignore
│   ├── package.json
│   └── public/
│
├── .gitignore
└── README.md
```

## 🚀 Deployment

### Backend Deployment (Heroku/Render)
1. Create account on Heroku/Render
2. Set environment variables
3. Connect Git repository
4. Deploy

### Frontend Deployment (Vercel/Netlify)
1. Build React app: `npm run build`
2. Deploy the `build` folder
3. Set API URL in environment variables

## 📄 Git Branching

Currently on `db_schema` branch for database schema implementation.

To switch to main:
```bash
git checkout main
```

To merge db_schema to main:
```bash
git checkout main
git merge db_schema
```

## 🤝 Contributing

1. Create a feature branch
2. Commit changes
3. Push to GitHub
4. Create a Pull Request

## 📝 License

This project is for educational purposes.

## 👨‍💻 Author

Developed as a complete MERN Stack Campus Management System

---

**For questions or support, contact your project mentor.**  
- **Project Type:** Documentation & Design Phase  
- **Document Owner:** Saadia Taqveem  

---

## ✅ Current Status

📘 Documentation completed  
💻 Backend connected to MongoDB
🚧 Frontend & API implementation planned for future phases
