# Task-Manager-SDLC--SEN-201
Full SDLC (Software Development Life Cycle)

1. Planning Phase

· Objective: Create a web-based task management app
· Scope: CRUD operations for tasks, user authentication, task categorization
· Tools: HTML/CSS/JavaScript (Frontend), Node.js/Express (Backend), MongoDB
· Team: 1 developer (individual project)
· Timeline: 7 days

2. Requirements Analysis

Functional Requirements:

· User registration/login
· Create, read, update, delete tasks
· Mark tasks as complete/incomplete
· Filter tasks by status/category

Non-Functional Requirements:

· Responsive UI
· Secure authentication
· Data persistence

3. Design Phase

Tech Stack:

· Frontend: HTML5, CSS3, JavaScript
· Backend: Node.js, Express.js
· Database: MongoDB
· Authentication: JWT

Database Schema:

```javascript
User {
  _id: ObjectId,
  username: String,
  email: String,
  password: String
}

Task {
  _id: ObjectId,
  title: String,
  description: String,
  status: String, // 'pending', 'in-progress', 'completed'
  priority: Number, // 1-3
  userId: ObjectId,
  createdAt: Date
}
```



4. Testing Phase

· Unit testing API endpoints
· Integration testing
· UI testing
· Security testing

5. Deployment

· Deploy backend to Render/Railway
· Deploy frontend to Netlify/Vercel
· MongoDB Atlas for database

6. Maintenance

· Bug fixes
· Feature enhancements
· Performance optimization
