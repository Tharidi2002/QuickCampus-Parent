# QuickCampus Mini - Student Management System

## Student Information
- **Student Name:** [Your Name]
- **Student Number:** [Your Student Number]
- **Slack Handle:** [Your Slack Handle]
- **GCP Project ID:** [Your GCP Project ID]

## Project Description
QuickCampus Mini is a cloud-native microservice-based student management system built for the Enterprise Cloud Architecture (ITS 2130) final project. This system demonstrates the implementation of modern cloud architecture patterns including microservices, service discovery, configuration management, API gateway, and cloud-native deployment.

## Technology Stack

### Backend Services
- **Java Version:** 25
- **Framework:** Spring Boot 3.2.5
- **Microservices:** Spring Cloud 2023.0.1
- **Service Registry:** Eureka Server
- **Configuration:** Spring Cloud Config Server
- **API Gateway:** Spring Cloud Gateway
- **Databases:** 
  - MySQL (Relational) - Student Service
  - MongoDB (Non-Relational) - Profile Service
- **Cloud Storage:** Google Cloud Storage
- **Process Management:** PM2

### Frontend
- **Technology:** HTML5, CSS3, JavaScript
- **Deployment:** Google Cloud Run (Serverless)

### Cloud Platform
- **Provider:** Google Cloud Platform (GCP)
- **Backend Deployment:** IaaS (VM Instances with Auto-scaling)
- **Frontend Deployment:** PaaS/Serverless (Cloud Run)

## Architecture Overview

### Microservices
1. **Eureka Server** (Port 8761) - Service Registry
2. **Config Server** (Port 8888) - Centralized Configuration
3. **Student Service** (Port 8081) - Student Management (MySQL)
4. **Profile Service** (Port 8082) - Profile Management (MongoDB + Cloud Storage)
5. **API Gateway** (Port 8080) - Single Entry Point

### Database Integration
- **MySQL:** Stores student basic information (name, age, email, etc.)
- **MongoDB:** Stores profile data and metadata
- **Google Cloud Storage:** Stores profile images

## Project Structure

```
QuickCampus-Parent/
├── eureka-server/          # Service Registry
├── config-server/          # Configuration Server
├── student-service/        # Student Management Service
├── profile-service/        # Profile Management Service
├── api-gateway/           # API Gateway
├── frontend/              # Web Application
├── config-repo/           # Configuration Files
├── ecosystem.config.json  # PM2 Configuration
├── deploy-gcp.sh         # GCP Deployment Script
├── startup-script.sh     # VM Startup Script
└── GCP-SETUP.md          # GCP Setup Instructions
```

## Setup / Getting Started

### Prerequisites
- Java 25 installed
- Maven 3.6+
- Node.js 18+
- PM2 installed globally
- GCP Account with billing enabled
- gcloud CLI configured

### Local Development Setup

1. **Clone the Repository**
   ```bash
   git clone https://github.com/your-username/QuickCampus-Parent.git
   cd QuickCampus-Parent
   ```

2. **Setup Databases**
   ```bash
   # Start MySQL
   mysql -u root -p
   CREATE DATABASE quickcampus_student;
   
   # Start MongoDB
   mongod
   ```

3. **Build All Services**
   ```bash
   mvn clean package -DskipTests
   ```

4. **Start Services Locally**
   ```bash
   # Start Eureka Server
   java -jar eureka-server/target/eureka-server-1.0.0.jar
   
   # Start Config Server
   java -jar config-server/target/config-server-1.0.0.jar
   
   # Start Student Service
   java -jar student-service/target/student-service-1.0.0.jar
   
   # Start Profile Service
   java -jar profile-service/target/profile-service-1.0.0.jar
   
   # Start API Gateway
   java -jar api-gateway/target/api-gateway-1.0.0.jar
   ```

5. **Access the Application**
   - API Gateway: http://localhost:8080
   - Eureka Dashboard: http://localhost:8761
   - Frontend: Open `frontend/index.html` in browser

### GCP Deployment

1. **Follow GCP Setup Instructions**
   - Refer to `GCP-SETUP.md` for detailed GCP setup

2. **Deploy to GCP**
   ```bash
   chmod +x deploy-gcp.sh
   ./deploy-gcp.sh
   ```

## API Endpoints

### Student Service
- `GET /api/students` - Get all students
- `GET /api/students/{id}` - Get student by ID
- `POST /api/students` - Create new student
- `PUT /api/students/{id}` - Update student
- `DELETE /api/students/{id}` - Delete student

### Profile Service
- `GET /api/profiles/student/{studentId}` - Get profile by student ID
- `POST /api/profiles` - Create/update profile
- `PUT /api/profiles/student/{studentId}` - Update profile
- `DELETE /api/profiles/student/{studentId}` - Delete profile
- `POST /api/profiles/student/{studentId}/upload-image` - Upload profile image

## Cloud Features Demonstrated

### High Availability & Auto Scaling
- Managed Instance Groups with auto-scaling
- Load Balancer with health checks
- Multi-zone deployment
- Automatic failover

### Process Management
- PM2 for process management
- Automatic restart on failure
- Log management
- Cluster mode for high availability

### Cloud Storage Integration
- Google Cloud Storage for file uploads
- Public URL generation for images
- Secure file management

### Configuration Management
- Spring Cloud Config Server
- Externalized configuration
- Environment-specific configs

## Monitoring & Health Checks
- Spring Boot Actuator endpoints
- Health check endpoints for all services
- PM2 monitoring
- GCP health checks for load balancer

## Repository Structure (Polyrepo with Git Submodules)

This project follows a polyrepo architecture with Git submodules:

### Main Repositories
1. **Backend Platform Repository** - Contains Eureka, Config Server, and API Gateway
2. **Backend Services Repository** - Contains Student and Profile Services
3. **Frontend Repository** - Contains the web application

Each repository includes related services as Git submodules for proper dependency management.

## Screen Recording
A screen recording demonstrating the complete system functionality is available at:
[Your Screen Recording Link]

## Submission Information
- **Submission Date:** March 31, 2026
- **Module:** ITS 2130 - Enterprise Cloud Architecture
- **Institution:** IJSE - Institute of Java and Software Engineering

## Important Notes
- This project fulfills all requirements for the Enterprise Cloud Architecture final project
- All services are deployed using IaaS model (VMs) for backend
- Frontend is deployed using PaaS/Serverless model (Cloud Run)
- System demonstrates cloud-native scalability and high availability
- PM2 is used for mandatory process management requirements
