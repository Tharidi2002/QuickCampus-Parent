#!/bin/bash

# Git Repository Setup Script for QuickCampus Mini
# This script sets up the polyrepo structure with Git submodules

echo "Setting up Git repositories with submodules..."

# Define repository names
PLATFORM_REPO="quickcampus-backend-platform"
SERVICES_REPO="quickcampus-backend-services"
FRONTEND_REPO="quickcampus-frontend"

# Create platform repository
echo "Creating platform repository..."
mkdir -p ../$PLATFORM_REPO
cd ../$PLATFORM_REPO
git init

# Add platform services as submodules
git submodule add ../../QuickCampus-Parent/eureka-server
git submodule add ../../QuickCampus-Parent/config-server
git submodule add ../../QuickCampus-Parent/api-gateway

# Create platform README
cat > README.md << EOF
# QuickCampus Backend Platform

**Student Name:** [Your Name]
**Student Number:** [Your Student Number]
**Slack Handle:** [Your Slack Handle]
**GCP Project ID:** [Your GCP Project ID]

## Description
This repository contains the platform services for the QuickCampus Mini student management system.

## Services Included
- **eureka-server:** Service Registry (Port 8761)
- **config-server:** Configuration Server (Port 8888)
- **api-gateway:** API Gateway (Port 8080)

## Setup
\`\`\`bash
# Initialize submodules
git submodule update --init --recursive

# Build all services
mvn clean package -DskipTests

# Start with PM2
pm2 start ecosystem.config.json
\`\`\`

## Deployment
Follow the deployment instructions in the main project repository.
EOF

git add README.md
git commit -m "Initial commit - Platform services"
cd ../QuickCampus-Parent

# Create services repository
echo "Creating services repository..."
mkdir -p ../$SERVICES_REPO
cd ../$SERVICES_REPO
git init

# Add business services as submodules
git submodule add ../../QuickCampus-Parent/student-service
git submodule add ../../QuickCampus-Parent/profile-service

# Create services README
cat > README.md << EOF
# QuickCampus Backend Services

**Student Name:** [Your Name]
**Student Number:** [Your Student Number]
**Slack Handle:** [Your Slack Handle]
**GCP Project ID:** [Your GCP Project ID]

## Description
This repository contains the business logic services for the QuickCampus Mini student management system.

## Services Included
- **student-service:** Student Management Service (MySQL)
- **profile-service:** Profile Management Service (MongoDB + Cloud Storage)

## Setup
\`\`\`bash
# Initialize submodules
git submodule update --init --recursive

# Build all services
mvn clean package -DskipTests

# Start with PM2
pm2 start ecosystem.config.json
\`\`\`

## Database Requirements
- MySQL database named 'quickcampus_student'
- MongoDB database named 'quickcampus_profile'
- Google Cloud Storage bucket for profile images

## Deployment
Follow the deployment instructions in the main project repository.
EOF

git add README.md
git commit -m "Initial commit - Business services"
cd ../QuickCampus-Parent

# Create frontend repository
echo "Creating frontend repository..."
mkdir -p ../$FRONTEND_REPO
cd ../$FRONTEND_REPO
git init

# Copy frontend files
cp -r ../QuickCampus-Parent/frontend/* .

# Create frontend README
cat > README.md << EOF
# QuickCampus Frontend Application

**Student Name:** [Your Name]
**Student Number:** [Your Student Number]
**Slack Handle:** [Your Slack Handle]
**GCP Project ID:** [Your GCP Project ID]

## Description
Frontend web application for the QuickCampus Mini student management system.

## Technology Stack
- HTML5, CSS3, JavaScript
- Responsive design
- RESTful API integration

## Deployment URL
[Your deployed Cloud Run URL will be here]

## Local Development
\`\`\`bash
# Simply open index.html in a web browser
# Or serve with a local web server
python -m http.server 8000
\`\`\`

## Features
- Student management (CRUD operations)
- Profile management with image upload
- Responsive design
- Real-time API integration

## API Integration
The frontend connects to the backend services through the API Gateway at port 8080.
EOF

git add .
git commit -m "Initial commit - Frontend application"
cd ../QuickCampus-Parent

# Initialize main repository
echo "Initializing main repository..."
git init
git add .
git commit -m "Initial complete project setup"

echo "Git repository setup completed!"
echo ""
echo "Repositories created:"
echo "1. $PLATFORM_REPO - Platform services (Eureka, Config, Gateway)"
echo "2. $SERVICES_REPO - Business services (Student, Profile)"
echo "3. $FRONTEND_REPO - Frontend application"
echo ""
echo "Next steps:"
echo "1. Push each repository to GitHub"
echo "2. Update README files with your personal information"
echo "3. Update GCP project ID in configuration files"
echo "4. Test the complete system"
echo "5. Record your screen recording for submission"
