# EcoDEX - Pokemon Go for Plants and Animals

A gamified learning platform where users can take photos of real-life plants and animals, get AI-powered identification, and build their personal EcoDEX collection.

## Features

- User registration and authentication
- Secure JWT-based login system
- Dashboard with user stats and discoveries
- Responsive design for mobile and desktop
- Ready for AI integration for plant/animal identification

## Tech Stack

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT Authentication
- bcryptjs for password hashing

### Frontend
- React.js
- React Router for navigation
- Context API for state management
- Axios for API calls
- Responsive CSS

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas)
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone https://github.com/HarshRajSinghania/ecodex-backend.git
cd EcoDEX
```

2. Install backend dependencies
```bash
npm install
```

3. Install frontend dependencies
```bash
cd client
npm install
cd ..
```

4. Set up environment variables
Create a `.env` file in the root directory:
```
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/ecodex
JWT_SECRET=your_jwt_secret_key_here_change_in_production
```

5. Start MongoDB
Make sure MongoDB is running on your system.

### Running the Application

#### Development Mode

1. Start the backend server:
```bash
npm run dev
```

2. In a new terminal, start the frontend:
```bash
npm run client
```

The backend will run on `http://localhost:5000` and the frontend on `http://localhost:3000`.

#### Production Mode

1. Build the frontend:
```bash
npm run build
```

2. Start the production server:
```bash
npm start
```

## Project Structure

```
EcoDEX/
├── client/                 # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/     # React components
│   │   │   ├── auth/       # Authentication components
│   │   │   ├── dashboard/  # Dashboard components
│   │   │   ├── layout/     # Layout components
│   │   │   └── routing/    # Routing components
│   │   ├── context/        # React Context files
│   │   ├── utils/          # Utility functions
│   │   ├── App.js          # Main App component
│   │   └── App.css         # Global styles
│   └── package.json
├── models/                 # MongoDB models
├── routes/                 # Express routes
├── middleware/             # Custom middleware
├── server.js              # Express server
├── package.json           # Backend dependencies
└── .env                   # Environment variables
```
