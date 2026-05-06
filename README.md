# Team Task Manager

A full-stack MERN task management web app with role-based access for Admin and Member users.

## Features
- Authentication: signup, login, JWT-based sessions
- Project management: create, update, delete projects
- Task management: create tasks, assign tasks, update status
- Role-based access: Admin vs Member permissions
- Dashboard: project and task overview
- REST API + MongoDB backend

## Project Structure

- `/backend` - Express API, MongoDB models, auth middleware, role restrictions
- `/frontend` - React SPA, forms, dashboard and client-side API calls

## Setup

### Backend
1. `cd backend`
2. `npm install`
3. Copy `.env.example` to `.env` and add `MONGO_URI` and `JWT_SECRET`
4. `npm run dev`

### Frontend
1. `cd frontend`
2. `npm install`
3. `npm start`

## Environment
- Backend default URL: `http://localhost:5000`
- Frontend default URL: `http://localhost:3000`

## Deployment
To deploy on Railway or another platform:
- Add `MONGO_URI` and `JWT_SECRET` as environment variables
- Deploy backend with port `process.env.PORT`
- Build frontend for static hosting

## Notes
This starter includes a full MERN structure for a team task manager app. Extend it with richer validation, pagination, search, and a polished UI for a complete portfolio submission.
