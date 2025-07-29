#!/bin/bash

echo "🚀 EcoDEX Deployment Setup Script"
echo "================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

# Check if git is installed
if ! command -v git &> /dev/null; then
    print_error "Git is not installed. Please install Git first."
    exit 1
fi

print_info "This script will help you set up separate repositories for frontend and backend deployment."
echo ""

# Get user input
read -p "Enter your GitHub username: " GITHUB_USERNAME
read -p "Enter backend repository name (default: ecodex-backend): " BACKEND_REPO
read -p "Enter frontend repository name (default: ecodex-frontend): " FRONTEND_REPO

# Set defaults
BACKEND_REPO=${BACKEND_REPO:-ecodex-backend}
FRONTEND_REPO=${FRONTEND_REPO:-ecodex-frontend}

echo ""
print_info "Repository URLs:"
echo "Backend:  https://github.com/$GITHUB_USERNAME/$BACKEND_REPO"
echo "Frontend: https://github.com/$GITHUB_USERNAME/$FRONTEND_REPO"
echo ""

read -p "Continue with setup? (y/N): " CONFIRM
if [[ ! $CONFIRM =~ ^[Yy]$ ]]; then
    echo "Setup cancelled."
    exit 0
fi

# Create directories
print_info "Creating deployment directories..."
mkdir -p ../deployment
mkdir -p ../deployment/$BACKEND_REPO
mkdir -p ../deployment/$FRONTEND_REPO

# Copy backend files
print_info "Copying backend files..."
cp -r middleware models routes server.js package.json vercel.json .env.example .gitignore ../deployment/$BACKEND_REPO/
cp VERCEL_DEPLOYMENT_GUIDE.md ../deployment/$BACKEND_REPO/README.md

# Copy frontend files
print_info "Copying frontend files..."
cp -r client/* ../deployment/$FRONTEND_REPO/
cp client/.env.example ../deployment/$FRONTEND_REPO/

# Create backend README
cat > ../deployment/$BACKEND_REPO/README.md << EOF
# EcoDEX Backend

Backend API for the EcoDEX gamified learning platform for identifying plants and animals.

## Features

- User authentication with JWT
- Plant/animal identification using OpenAI Vision API
- EcoDEX entry management
- AI-powered chat with Dr. Maya Chen
- Image processing and storage

## Environment Variables

Copy \`.env.example\` to \`.env\` and fill in your values:

\`\`\`bash
cp .env.example .env
\`\`\`

Required variables:
- \`MONGODB_URI\`: MongoDB Atlas connection string
- \`OPENAI_API_KEY\`: OpenAI API key
- \`JWT_SECRET\`: Secret for JWT tokens
- \`FRONTEND_URL\`: Your frontend domain for CORS

## Deployment

This backend is configured for Vercel deployment. See the deployment guide for detailed instructions.

## Local Development

\`\`\`bash
npm install
npm start
\`\`\`

## API Endpoints

- \`POST /api/auth/register\` - User registration
- \`POST /api/auth/login\` - User login
- \`GET /api/auth/me\` - Get current user
- \`POST /api/ecodex/identify\` - Identify species from image
- \`GET /api/ecodex/entries\` - Get user's EcoDEX entries
- \`GET /api/ecodex/stats\` - Get user statistics
- \`POST /api/ecodex/chat\` - Chat with AI ecologist
EOF

# Create frontend README
cat > ../deployment/$FRONTEND_REPO/README.md << EOF
# EcoDEX Frontend

React frontend for the EcoDEX gamified learning platform for identifying plants and animals.

## Features

- Camera integration for species identification
- User authentication and profiles
- EcoDEX collection management
- AI-powered chat interface
- PWA capabilities
- Responsive design for mobile and desktop

## Environment Variables

Copy \`.env.example\` to \`.env\` and fill in your values:

\`\`\`bash
cp .env.example .env
\`\`\`

Required variables:
- \`REACT_APP_API_URL\`: Your backend API URL

## Deployment

This frontend is configured for Vercel deployment. See the deployment guide for detailed instructions.

## Local Development

\`\`\`bash
npm install
npm start
\`\`\`

## Build

\`\`\`bash
npm run build
\`\`\`

## Technologies Used

- React 19
- Redux Toolkit
- React Router
- Axios
- PWA features
EOF

# Initialize git repositories
print_info "Initializing Git repositories..."

# Backend repository
cd ../deployment/$BACKEND_REPO
git init
git add .
git commit -m "Initial backend setup for Vercel deployment"
git branch -M main

print_status "Backend repository initialized"
print_info "To push to GitHub, run:"
echo "  cd ../deployment/$BACKEND_REPO"
echo "  git remote add origin https://github.com/$GITHUB_USERNAME/$BACKEND_REPO.git"
echo "  git push -u origin main"
echo ""

# Frontend repository
cd ../$FRONTEND_REPO
git init
git add .
git commit -m "Initial frontend setup for Vercel deployment"
git branch -M main

print_status "Frontend repository initialized"
print_info "To push to GitHub, run:"
echo "  cd ../deployment/$FRONTEND_REPO"
echo "  git remote add origin https://github.com/$GITHUB_USERNAME/$FRONTEND_REPO.git"
echo "  git push -u origin main"
echo ""

cd ../../"MERN Stack"

print_status "Deployment setup complete!"
echo ""
print_info "Next steps:"
echo "1. Create repositories on GitHub:"
echo "   - $BACKEND_REPO"
echo "   - $FRONTEND_REPO"
echo ""
echo "2. Push the code using the commands above"
echo ""
echo "3. Deploy to Vercel:"
echo "   - Import both repositories to Vercel"
echo "   - Set environment variables"
echo "   - Deploy!"
echo ""
echo "4. Update CORS settings in backend with your frontend URL"
echo ""
print_warning "Don't forget to set up your environment variables in Vercel!"
EOF