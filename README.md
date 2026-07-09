# GymTrack Pro

GymTrack Pro is a full-stack fitness tracking web application built with React, Node.js, Express and MySQL.

The application allows users to manage workout programs, log workout sets, track daily calories and water intake, follow body measurements, upload progress photos, and analyze performance with charts.

## Features

- User register and login system
- Password hashing with bcrypt
- User-based data separation
- Workout program management
- Workout logging with set, weight, reps and volume tracking
- Daily calorie, water and body weight tracking
- Body measurement tracking
- Progress photo upload and delete
- Dashboard with daily summaries
- Analytics charts
- Personal records and performance statistics
- Premium dark dashboard UI

## Tech Stack

### Frontend

- React
- Vite
- Axios
- Recharts
- CSS

### Backend

- Node.js
- Express.js
- MySQL
- mysql2
- multer
- bcryptjs
- dotenv
- cors

## Project Structure

```text
GymTrack-Pro
├── backend
│   ├── routes
│   ├── db.js
│   ├── server.js
│   └── .env.example
├── frontend
│   ├── src
│   │   ├── api
│   │   ├── components
│   │   ├── App.jsx
│   │   └── App.css
│   └── package.json
├── .gitignore
└── README.md