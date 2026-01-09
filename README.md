# ClubSphere
ClubSphere — Campus Club Event Management System
MERN Stack Student Project – Technical Documentation
1. Introduction
1.1 Purpose
This document defines the complete technical design and development guidelines for ClubSphere, a
Campus Club Event Management System. The application simplifies the creation, management, and
participation of college club events while providing hands-on MERN stack development experience.
1.2 Target Audience
• College Faculty / Mentors
• Undergraduate Students
• Developers learning full-stack architecture
1.3 Learning Outcomes
• Role-based access control (RBAC)
• REST API design
• MongoDB schema design using Mongoose
• MERN stack integration
• GitHub-based collaborative workflow
2. System Overview
2.1 User Roles
Role    | Description
Student | Views events, registers/unregisters, tracks participation
Club    | Admin Creates, updates, deletes, and manages events
2.2 Core Features
• Event management (CRUD)
• Student event registration
• Student dashboard for events
• Admin dashboard for participant management
3. High-Level Architecture
Frontend: React.js
Backend: Node.js with Express.js
Database: MongoDB
Architecture Principle: Clear separation of frontend, backend, and database layers.
[ React Frontend ]
 |
 REST API
 |
[ Node.js + Express ]
 |
 MongoDB
4. Database Design
4.1 Database
MongoDB (Local or Atlas) using Mongoose ODM.
4.2 Collections
users {
 _id: ObjectId,
 name: String,
 email: String,
 role: student | admin,
 clubName: String,
 createdAt: Date
}
events {
 _id: ObjectId,
 title: String,
 description: String,
 date: Date,
 location: String,
 createdBy: ObjectId
}
registrations {
 _id: ObjectId,
 eventId: ObjectId,
 studentId: ObjectId,
 registeredAt: Date
}
5. Backend Design
Technology Stack: Node.js, Express.js, MongoDB, JWT Authentication
Backend Folder Structure:
backend/
■■■ controllers/
■■■ models/
■■■ routes/
■■■ middleware/
■■■ app.js
6. Frontend Design
React.js with React Router and Axios.
Key Pages:
• Login / Signup
• Student Dashboard
• Event Details & Registration
• Admin Dashboard
7. Security Considerations
• JWT-based authentication
• Role-based authorization
• Input validation
8. Future Enhancements
• Email notifications
• QR-based attendance system
• Analytics dashboard
• Multi-club support
9. Conclusion
ClubSphere demonstrates a real-world MERN stack application for managing campus club events,
strengthening full-stack development skills.
Project Name: ClubSphere
Document Owner: Saadia Taqveem
