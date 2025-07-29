# EcoDEX Vercel Deployment Guide

This guide will help you deploy your MERN Stack EcoDEX application to Vercel using separate GitHub repositories for frontend and backend.

## Overview

We'll create two separate repositories:
1. **ecodex-frontend** - React client application
2. **ecodex-backend** - Node.js/Express server

## Step 1: Prepare Backend for Vercel

### 1.1 Create Backend Repository Structure

Create a new directory for your backend and copy the following files:
```
ecodex-backend/
├── server.js
├── package.json
├── vercel.json
├── .env.example
├── middleware/
├── models/
├── routes/
└── README.md
```

### 1.2 Update Backend package.json

Your backend package.json should include:
```json
{
  "name": "ecodex-backend",
  "version": "1.0.0",
  "description": "EcoDEX Backend API",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  },
  "dependencies": {
    "@google/generative-ai": "^0.24.1",
    "axios": "^1.11.0",
    "bcryptjs": "^2.4.3",
    "cloudinary": "^2.7.0",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1",
    "express": "^4.18.2",
    "express-validator": "^7.0.1",
    "form-data": "^4.0.4",
    "jsonwebtoken": "^9.0.2",
    "mongoose": "^7.5.0",
    "multer": "^1.4.5-lts.1",
    "openai": "^5.10.2",
    "sharp": "^0.34.3"
  }
}
```

### 1.3 Create/Update vercel.json for Backend

```json
{
  "version": 2,
  "builds": [
    {
      "src": "server.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/server.js"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  }
}
```

### 1.4 Update server.js for Production

Add CORS configuration for your frontend domain:
```javascript
// Update CORS configuration
const corsOptions = {
  origin: [
    'http://localhost:3000',
    'https://your-frontend-domain.vercel.app'
  ],
  credentials: true
};
app.use(cors(corsOptions));
```

## Step 2: Prepare Frontend for Vercel

### 2.1 Create Frontend Repository Structure

Create a new directory for your frontend:
```
ecodex-frontend/
├── public/
├── src/
├── package.json
├── .env.example
├── vercel.json
└── README.md
```

### 2.2 Update Frontend package.json

Remove the proxy setting and update scripts:
```json
{
  "name": "ecodex-frontend",
  "version": "0.1.0",
  "private": true,
  "dependencies": {
    "@reduxjs/toolkit": "^2.8.2",
    "@testing-library/dom": "^10.4.1",
    "@testing-library/jest-dom": "^6.6.4",
    "@testing-library/react": "^16.3.0",
    "@testing-library/user-event": "^13.5.0",
    "axios": "^1.11.0",
    "react": "^19.1.1",
    "react-dom": "^19.1.1",
    "react-redux": "^9.2.0",
    "react-router-dom": "^7.7.1",
    "react-scripts": "5.0.1",
    "redux": "^5.0.1",
    "redux-thunk": "^3.1.0",
    "web-vitals": "^2.1.4"
  },
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject"
  }
}
```

### 2.3 Create vercel.json for Frontend

```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "build"
      }
    }
  ],
  "routes": [
    {
      "src": "/static/(.*)",
      "dest": "/static/$1"
    },
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ]
}
```

### 2.4 Update API Base URL

Create a config file for API endpoints:
```javascript
// src/config/api.js
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export default API_BASE_URL;
```

Update your axios calls to use this base URL instead of relative paths.

## Step 3: Environment Variables

### 3.1 Backend Environment Variables (.env.example)

```env
# MongoDB Configuration
MONGODB_URI=your_mongodb_atlas_connection_string

# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key
OPENAI_BASE_URL=https://api.openai.com/v1
OPENAI_MODEL=gpt-4-vision-preview

# Server Configuration
NODE_ENV=production
PORT=5000

# JWT Secret
JWT_SECRET=your_jwt_secret_key
```

### 3.2 Frontend Environment Variables (.env.example)

```env
# API Configuration
REACT_APP_API_URL=https://your-backend-domain.vercel.app

# Other frontend-specific variables
REACT_APP_APP_NAME=EcoDEX
```

## Step 4: GitHub Repository Setup

### 4.1 Create Backend Repository

1. Create a new repository on GitHub: `ecodex-backend`
2. Initialize git in your backend directory:
```bash
git init
git add .
git commit -m "Initial backend setup"
git branch -M main
git remote add origin https://github.com/yourusername/ecodex-backend.git
git push -u origin main
```

### 4.2 Create Frontend Repository

1. Create a new repository on GitHub: `ecodex-frontend`
2. Initialize git in your frontend directory:
```bash
git init
git add .
git commit -m "Initial frontend setup"
git branch -M main
git remote add origin https://github.com/yourusername/ecodex-frontend.git
git push -u origin main
```

## Step 5: Deploy to Vercel

### 5.1 Deploy Backend

1. Go to [vercel.com](https://vercel.com) and sign in with GitHub
2. Click "New Project"
3. Import your `ecodex-backend` repository
4. Configure environment variables in Vercel dashboard
5. Deploy

### 5.2 Deploy Frontend

1. Import your `ecodex-frontend` repository
2. Set environment variables (including `REACT_APP_API_URL` with your backend URL)
3. Deploy

## Step 6: Post-Deployment Configuration

### 6.1 Update CORS in Backend

Update your backend's CORS configuration with the actual frontend URL:
```javascript
const corsOptions = {
  origin: [
    'http://localhost:3000',
    'https://your-actual-frontend-domain.vercel.app'
  ],
  credentials: true
};
```

### 6.2 Test the Deployment

1. Test API endpoints directly
2. Test frontend functionality
3. Verify database connections
4. Test image upload and AI features

## Troubleshooting

### Common Issues:

1. **CORS Errors**: Ensure backend CORS is configured with frontend URL
2. **Environment Variables**: Double-check all environment variables are set in Vercel
3. **API Calls**: Ensure frontend is using absolute URLs for API calls
4. **Build Errors**: Check build logs in Vercel dashboard

### Useful Commands:

```bash
# Test backend locally
npm start

# Test frontend locally with production API
REACT_APP_API_URL=https://your-backend.vercel.app npm start

# Build frontend locally
npm run build
```

## Security Considerations

1. Never commit `.env` files to GitHub
2. Use strong JWT secrets
3. Validate all API inputs
4. Implement rate limiting
5. Use HTTPS in production

## Next Steps

After successful deployment:
1. Set up custom domains (optional)
2. Configure monitoring and analytics
3. Set up CI/CD pipelines
4. Implement error tracking (Sentry, etc.)
5. Add performance monitoring

---

**Note**: Replace placeholder URLs and credentials with your actual values during deployment.