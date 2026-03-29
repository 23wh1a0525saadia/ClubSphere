# ClubSphere - Database Schema Documentation

## Overview

This document describes the MongoDB database schema for the ClubSphere Campus Club Event Management System. The database follows a normalized structure with references between collections for efficient data management.

---

## 1. Users Collection

**Purpose**: Store user account information and authentication details.

```javascript
{
  "_id": ObjectId,
  "name": {
    "type": String,
    "required": true,
    "trim": true,
    "maxLength": 50
  },
  "email": {
    "type": String,
    "required": true,
    "unique": true,
    "lowercase": true,
    "match": "email_regex"
  },
  "password": {
    "type": String,
    "required": true,
    "select": false,
    "minLength": 6
  },
  "role": {
    "type": String,
    "enum": ["student", "admin", "president"],
    "default": "student"
  },
  "registrationNumber": {
    "type": String,
    "unique": true,
    "sparse": true
  },
  "department": {
    "type": String,
    "enum": ["CSE", "ECE", "ME", "CE", "EEE", "BT", "OTHER"],
    "default": "OTHER"
  },
  "semester": {
    "type": Number,
    "min": 1,
    "max": 8
  },
  "clubsJoined": [
    {
      "type": ObjectId,
      "ref": "Club"
    }
  ],
  "eventsRegistered": [
    {
      "type": ObjectId,
      "ref": "Registration"
    }
  ],
  "profileImage": String,
  "isActive": {
    "type": Boolean,
    "default": true
  },
  "createdAt": {
    "type": Date,
    "default": "Date.now"
  },
  "updatedAt": {
    "type": Date,
    "default": "Date.now"
  }
}
```

**Indexes**:
- `email`: unique
- `registrationNumber`: unique, sparse

**Middleware**:
- Password hashed before save (bcrypt)

---

## 2. Clubs Collection

**Purpose**: Store club information, members, and related data.

```javascript
{
  "_id": ObjectId,
  "name": {
    "type": String,
    "required": true,
    "unique": true,
    "trim": true,
    "maxLength": 100
  },
  "description": {
    "type": String,
    "required": true,
    "maxLength": 1000
  },
  "president": {
    "type": ObjectId,
    "ref": "User",
    "required": true
  },
  "vicePrincipal": {
    "type": ObjectId,
    "ref": "User",
    "default": null
  },
  "secretary": {
    "type": ObjectId,
    "ref": "User",
    "default": null
  },
  "members": [
    {
      "type": ObjectId,
      "ref": "User"
    }
  ],
  "category": {
    "type": String,
    "enum": ["academic", "cultural", "sports", "technical", "social", "professional"],
    "required": true
  },
  "email": {
    "type": String,
    "lowercase": true,
    "match": "email_regex"
  },
  "logo": String,
  "coverImage": String,
  "events": [
    {
      "type": ObjectId,
      "ref": "Event"
    }
  ],
  "announcements": [
    {
      "type": ObjectId,
      "ref": "Announcement"
    }
  ],
  "memberCount": {
    "type": Number,
    "default": 0
  },
  "isActive": {
    "type": Boolean,
    "default": true
  },
  "createdAt": {
    "type": Date,
    "default": "Date.now"
  },
  "updatedAt": {
    "type": Date,
    "default": "Date.now"
  }
}
```

**Indexes**:
- `name`: unique
- `president`: for quick president lookups

---

## 3. Events Collection

**Purpose**: Store event details, registrations, and status.

```javascript
{
  "_id": ObjectId,
  "title": {
    "type": String,
    "required": true,
    "trim": true,
    "maxLength": 150
  },
  "description": {
    "type": String,
    "required": true,
    "maxLength": 2000
  },
  "club": {
    "type": ObjectId,
    "ref": "Club",
    "required": true
  },
  "banner": String,
  "eventType": {
    "type": String,
    "enum": ["workshop", "seminar", "competition", "fest", "social", "technical", "other"],
    "required": true
  },
  "startDate": {
    "type": Date,
    "required": true
  },
  "endDate": {
    "type": Date,
    "required": true
  },
  "startTime": {
    "type": String,
    "required": true
  },
  "endTime": {
    "type": String,
    "required": true
  },
  "location": {
    "type": String,
    "required": true,
    "maxLength": 200
  },
  "capacity": {
    "type": Number,
    "required": true,
    "min": 1
  },
  "registrations": [
    {
      "type": ObjectId,
      "ref": "Registration"
    }
  ],
  "registrationCount": {
    "type": Number,
    "default": 0
  },
  "isRegistrationOpen": {
    "type": Boolean,
    "default": true
  },
  "organizers": [
    {
      "type": ObjectId,
      "ref": "User"
    }
  ],
  "status": {
    "type": String,
    "enum": ["upcoming", "ongoing", "completed", "cancelled"],
    "default": "upcoming"
  },
  "isFeatured": {
    "type": Boolean,
    "default": false
  },
  "createdAt": {
    "type": Date,
    "default": "Date.now"
  },
  "updatedAt": {
    "type": Date,
    "default": "Date.now"
  }
}
```

**Indexes**:
- `club`: for quick club events lookup
- `startDate`: for sorting
- `status`: for filtering

**Middleware**:
- Auto-update status based on dates

---

## 4. Registrations Collection

**Purpose**: Track student registrations for events.

```javascript
{
  "_id": ObjectId,
  "event": {
    "type": ObjectId,
    "ref": "Event",
    "required": true
  },
  "student": {
    "type": ObjectId,
    "ref": "User",
    "required": true
  },
  "club": {
    "type": ObjectId,
    "ref": "Club",
    "required": true
  },
  "registrationNumber": {
    "type": String,
    "required": true
  },
  "department": {
    "type": String,
    "required": true
  },
  "registeredAt": {
    "type": Date,
    "default": "Date.now"
  },
  "status": {
    "type": String,
    "enum": ["registered", "attended", "cancelled", "no-show"],
    "default": "registered"
  },
  "attendance": {
    "type": Boolean,
    "default": false
  },
  "attendedAt": {
    "type": Date,
    "default": null
  },
  "feedback": {
    "type": String,
    "maxLength": 500,
    "default": null
  },
  "rating": {
    "type": Number,
    "min": 0,
    "max": 5,
    "default": null
  }
}
```

**Indexes**:
- `event_1_student_1`: compound unique index
- `event`: for quick event registrations
- `student`: for user's registrations

---

## 5. Announcements Collection

**Purpose**: Store club announcements, news, and updates.

```javascript
{
  "_id": ObjectId,
  "title": {
    "type": String,
    "required": true,
    "trim": true,
    "maxLength": 200
  },
  "content": {
    "type": String,
    "required": true,
    "maxLength": 5000
  },
  "club": {
    "type": ObjectId,
    "ref": "Club",
    "required": true
  },
  "createdBy": {
    "type": ObjectId,
    "ref": "User",
    "required": true
  },
  "category": {
    "type": String,
    "enum": ["general", "event", "recruitment", "achievement", "important"],
    "default": "general"
  },
  "image": String,
  "priority": {
    "type": String,
    "enum": ["low", "medium", "high", "urgent"],
    "default": "medium"
  },
  "isPinned": {
    "type": Boolean,
    "default": false
  },
  "views": {
    "type": Number,
    "default": 0
  },
  "likes": [
    {
      "type": ObjectId,
      "ref": "User"
    }
  ],
  "comments": [
    {
      "user": {
        "type": ObjectId,
        "ref": "User"
      },
      "text": {
        "type": String,
        "required": true
      },
      "createdAt": {
        "type": Date,
        "default": "Date.now"
      }
    }
  ],
  "createdAt": {
    "type": Date,
    "default": "Date.now"
  },
  "updatedAt": {
    "type": Date,
    "default": "Date.now"
  }
}
```

**Indexes**:
- `club`: for club announcements
- `isPinned`: for pinned announcements
- `createdAt`: for sorting

---

## Relationships

### User → Club
- **One-to-Many**: One user can join multiple clubs (clubsJoined array)
- **One-to-Many**: One user is president of multiple clubs (president field)

### Club → Event
- **One-to-Many**: One club has many events (events array)

### Event → Registration
- **One-to-Many**: One event has many registrations (registrations array)

### User → Registration
- **One-to-Many**: One user can register for many events

### Club → Announcement
- **One-to-Many**: One club has many announcements

---

## Query Patterns

### User Related
- Find user by email
- Find all clubs joined by a user
- Find all events registered by a user
- Find all users in a role

### Club Related
- Find all clubs by category
- Find club members
- Find club events
- Find club announcements

### Event Related
- Find events by status
- Find events by club
- Find events in date range
- Find registrations for an event

### Registration Related
- Find registrations by student
- Find registrations by event
- Find attendance records

---

## Security Considerations

1. **Password Security**: Passwords are hashed using bcrypt
2. **Field Selection**: Passwords are excluded from queries (select: false)
3. **Unique Constraints**: Email and registration number are unique
4. **Role-Based**: Access control based on user role
5. **References**: Relations use ObjectId references for referential integrity

---

## Scaling Considerations

1. **Denormalization**: memberCount stored in Club for quick access
2. **Indexes**: Strategic indexes on frequently queried fields
3. **Pagination**: API routes support pagination for large datasets
4. **Date Management**: Separate startDate/endDate for range queries

---

## Data Validation

All collections implement Mongoose schema validation:
- Email format validation
- String length limits
- Enum value constraints
- Type checking
- Required field enforcement

---

This schema design follows MongoDB best practices and is optimized for the ClubSphere application requirements.
