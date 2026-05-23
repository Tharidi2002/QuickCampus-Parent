# QuickCampus - ECA Management System

A comprehensive microservices-based educational management system built with Spring Boot, Spring Cloud, and React. This system provides course management, student management, and media file handling with cloud integration using AWS RDS and Google Cloud Storage.

## 📋 Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Services](#services)
- [Technology Stack](#technology-stack)
- [Prerequisites](#prerequisites)
- [Cloud Configuration](#cloud-configuration)
- [Setup Instructions](#setup-instructions)
- [Running the Project](#running-the-project)
- [API Documentation](#api-documentation)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)

## 🎯 Overview

QuickCampus is a modern microservices architecture designed for educational institutions to manage courses, students, and media files efficiently. The system leverages cloud services for scalability and reliability.

**Key Features:**
- Course Management with CRUD operations
- Student Management with MongoDB
- Media File Management with Google Cloud Storage
- Service Discovery with Eureka
- API Gateway for unified access
- Modern React-based frontend
- Cloud integration with AWS RDS and GCS

## 🏗️ Architecture

```
┌─────────────────┐
│   Frontend App  │ (React + TypeScript)
│   Port: 3000    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   API Gateway   │ (Spring Cloud Gateway)
│   Port: 8080    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Eureka Server  │ (Service Discovery)
│   Port: 8761    │
└────────┬────────┘
         │
    ┌────┴────┬──────────┬──────────┐
    ▼         ▼          ▼          ▼
┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐
│ Course │ │Student │ │ Media  │ │        │
│Service │ │Service │ │Service │ │        │
│:8081   │ │:8082   │ │:8083   │ │        │
└───┬────┘ └───┬────┘ └───┬────┘ │        │
    │          │          │       │        │
    ▼          ▼          ▼       │        │
┌────────┐ ┌────────┐ ┌────────┐ │        │
│AWS RDS │ │MongoDB │ │  GCS   │ │        │
│MySQL   │ │        │ │Bucket  │ │        │
└────────┘ └────────┘ └────────┘ │        │
                               │        │
                        Cloud Infrastructure
```

## 🚀 Services

### 1. Eureka Discovery Server
- **Port:** 8761
- **Purpose:** Service discovery and registration
- **Technology:** Spring Cloud Eureka
- **Configuration:** `eureka-discovery-server/src/main/resources/application.yaml`

### 2. Course Service
- **Port:** 8081
- **Context Path:** `/course-service`
- **Purpose:** Course management operations
- **Database:** AWS RDS MySQL (eca_courses)
- **Technology:** Spring Boot, Spring Data JPA, MySQL
- **Configuration:** 
  - `course-service/src/main/resources/application.properties`
  - `course-service/src/main/resources/application-aws.properties`
  - `course-service/src/main/resources/application-docker.properties`

### 3. Student Service
- **Port:** 8082
- **Context Path:** `/student-service`
- **Purpose:** Student management operations
- **Database:** MongoDB (eca_students)
- **Technology:** Spring Boot, Spring Data MongoDB
- **Configuration:** `student-service/src/main/resources/application.properties`

### 4. Media Service
- **Port:** 8083
- **Context Path:** `/media-service`
- **Purpose:** Media file upload/download/management
- **Storage:** Google Cloud Storage
- **Technology:** Spring Boot, Google Cloud Storage
- **Configuration:** 
  - `media-service/src/main/resources/application.properties`
  - Documentation: `media-service/GCS_CONFIGURATION.md`

### 5. API Gateway
- **Port:** 8080
- **Purpose:** Unified API entry point and routing
- **Technology:** Spring Cloud Gateway
- **Configuration:** `api-gateway/src/main/resources/application.yaml`

### 6. Frontend Application
- **Port:** 3000
- **Purpose:** User interface for all operations
- **Technology:** React, TypeScript, Material-UI, Vite
- **Configuration:** `frontend-app/src/services/api.ts`

## 💻 Technology Stack

### Backend Services
- **Java:** 21
- **Spring Boot:** 3.5.5
- **Spring Cloud:** 2025.0.1
- **Build Tool:** Maven
- **Databases:**
  - MySQL (AWS RDS)
  - MongoDB
- **Cloud Services:**
  - AWS RDS (MySQL)
  - Google Cloud Storage
- **Service Discovery:** Netflix Eureka
- **API Gateway:** Spring Cloud Gateway

### Frontend Application
- **Framework:** React 18
- **Language:** TypeScript
- **UI Library:** Material-UI (MUI)
- **Build Tool:** Vite
- **HTTP Client:** Axios
- **Routing:** React Router
- **File Upload:** React Dropzone

## 🔧 Prerequisites

### Required Software
- **Java:** JDK 21 or higher
- **Maven:** 3.6+ (or use included mvnw)
- **Node.js:** 16+ 
- **npm** or **yarn**
- **Git**

### Cloud Services
- **AWS Account** with RDS configured
- **Google Cloud Platform Account** with GCS bucket
- **MongoDB** (local or cloud instance)

### Environment Variables
Set the following environment variables before running:

```bash
# Google Cloud Storage (Media Service)
export GCS_BUCKET_NAME=media-files
export GCS_PROJECT_ID=your-gcp-project-id
export GCS_CREDENTIALS_PATH=/path/to/service-account-key.json

# AWS RDS (Course Service) - configured in application-aws.properties
# MongoDB (Student Service) - configured in application.properties
```

## ☁️ Cloud Configuration

### AWS RDS Configuration (Course Service)

**Database Details:**
- **Endpoint:** courses.cvi228ykoapy.eu-north-1.rds.amazonaws.com:3306
- **Database:** eca_courses
- **Region:** eu-north-1
- **Username:** admin
- **Password:** mysql1234
- **Profile:** aws

**Configuration File:** `course-service/src/main/resources/application-aws.properties`

### Google Cloud Storage Configuration (Media Service)

**GCS Details:**
- **Bucket Name:** media-files
- **Project ID:** Set via `GCS_PROJECT_ID` environment variable
- **Authentication:** Service account JSON credentials
- **File Naming:** `{uuid}__{original-filename}`

**Setup Instructions:** See `media-service/GCS_CONFIGURATION.md`

### Eureka Discovery Server

**Server Details:**
- **IP Address:** 10.128.0.13
- **Port:** 8761
- **URL:** http://10.128.0.13:8761/eureka/

All services register with this Eureka server for service discovery.

## 📦 Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/Tharidi2002/QuickCampus-Parent.git
cd Cloud-Project
```

### 2. Set Up Google Cloud Storage

Follow the instructions in `media-service/GCS_CONFIGURATION.md`:

```bash
# Create GCS bucket
gsutil mb gs://media-files

# Create service account
gcloud iam service-accounts create media-service-sa \
  --description="Service account for media-service" \
  --display-name="Media Service"

# Grant permissions
gcloud projects add-iam-policy-binding PROJECT_ID \
  --member="serviceAccount:media-service-sa@PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/storage.objectAdmin"

# Download credentials
gcloud iam service-accounts keys create media-service-key.json \
  --iam-account=media-service-sa@PROJECT_ID.iam.gserviceaccount.com

# Set environment variable
export GOOGLE_APPLICATION_CREDENTIALS=/path/to/media-service-key.json
```

### 3. Set Up MongoDB

**Option A: Local MongoDB**
```bash
# Install MongoDB locally
# Create database and user
mongosh
use eca_students
db.createUser({
  user: "root",
  pwd: "mongo",
  roles: [{ role: "readWrite", db: "eca_students" }]
})
```

**Option B: MongoDB Atlas**
- Create a free MongoDB Atlas account
- Create a cluster
- Get connection string
- Update `student-service/src/main/resources/application.properties`

### 4. Configure Environment Variables

Create a `.env` file or set environment variables:

```bash
# GCS Configuration
export GCS_BUCKET_NAME=media-files
export GCS_PROJECT_ID=your-project-id
export GOOGLE_APPLICATION_CREDENTIALS=/path/to/credentials.json
```

### 5. Build Backend Services

```bash
# Build all services from root
mvn clean install -DskipTests

# Or build individual services
cd course-service && mvn clean install -DskipTests
cd ../student-service && mvn clean install -DskipTests
cd ../media-service && mvn clean install -DskipTests
cd ../api-gateway && mvn clean install -DskipTests
cd ../eureka-discovery-server && mvn clean install -DskipTests
```

### 6. Install Frontend Dependencies

```bash
cd frontend-app
npm install
```

## 🚀 Running the Project

### Start Services in Order

**1. Start Eureka Discovery Server**
```bash
cd eureka-discovery-server
mvn spring-boot:run
```
Verify at: http://localhost:8761

**2. Start Course Service**
```bash
cd course-service
mvn spring-boot:run
```
Verify at: http://localhost:8081/course-service

**3. Start Student Service**
```bash
cd student-service
mvn spring-boot:run
```
Verify at: http://localhost:8082/student-service

**4. Start Media Service**
```bash
cd media-service
mvn spring-boot:run
```
Verify at: http://localhost:8083/media-service

**5. Start API Gateway**
```bash
cd api-gateway
mvn spring-boot:run
```
Verify at: http://localhost:8080

**6. Start Frontend Application**
```bash
cd frontend-app
npm run dev
```
Open at: http://localhost:3000

### Using Docker (Alternative)

Build and run services using Docker:

```bash
# Build Docker images for each service
cd course-service && docker build -t course-service:latest .
cd ../student-service && docker build -t student-service:latest .
cd ../media-service && docker build -t media-service:latest .
cd ../api-gateway && docker build -t api-gateway:latest .
cd ../eureka-discovery-server && docker build -t eureka-server:latest .

# Run with Docker Compose (if available)
docker-compose up -d
```

## 📚 API Documentation

### Course Service API

**Base URL:** `http://localhost:8081/course-service`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/courses` | Get all courses |
| POST | `/courses` | Create new course |
| PUT | `/courses/{id}` | Update course |
| DELETE | `/courses/{id}` | Delete course |

**Example Request:**
```bash
curl -X POST http://localhost:8081/course-service/courses \
  -H "Content-Type: application/json" \
  -d '{"id":"CS101","name":"Java Programming","duration":"3 months"}'
```

### Student Service API

**Base URL:** `http://localhost:8082/student-service`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/students` | Get all students |
| POST | `/students` | Create new student |
| PUT | `/students/{registrationNumber}` | Update student |
| DELETE | `/students/{registrationNumber}` | Delete student |

**Example Request:**
```bash
curl -X POST http://localhost:8082/student-service/students \
  -H "Content-Type: application/json" \
  -d '{
    "registrationNumber": "S001",
    "fullName": "John Doe",
    "address": "123 Main St",
    "contact": "123-4567890",
    "email": "john@example.com"
  }'
```

### Media Service API

**Base URL:** `http://localhost:8083/media-service`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/files` | List all files |
| POST | `/files` | Upload file |
| GET | `/files/{id}` | Download file |
| DELETE | `/files/{id}` | Delete file |

**Example Request:**
```bash
# Upload file
curl -X POST -F "file=@document.pdf" \
  http://localhost:8083/media-service/files

# List files
curl http://localhost:8083/media-service/files
```

### API Gateway Routes

The API Gateway provides unified access to all services:

| Route | Target Service |
|-------|----------------|
| `/course-service/**` | Course Service |
| `/student-service/**` | Student Service |
| `/media-service/**` | Media Service |

**Example:**
```bash
# Access course service through gateway
curl http://localhost:8080/course-service/courses
```

## 🚢 Deployment

### Cloud Deployment Options

#### 1. Kubernetes Deployment

See deployment examples in `media-service/DEPLOYMENT_EXAMPLES.md`

**Steps:**
```bash
# Create namespace
kubectl create namespace microservices

# Create secrets
kubectl create secret generic gcs-credentials \
  --from-file=credentials.json=/path/to/service-account-key.json \
  -n microservices

# Apply configurations
kubectl apply -f k8s/

# Verify deployment
kubectl get pods -n microservices
```

#### 2. Docker Deployment

```bash
# Build images
docker build -t course-service:latest ./course-service
docker build -t student-service:latest ./student-service
docker build -t media-service:latest ./media-service
docker build -t api-gateway:latest ./api-gateway
docker build -t eureka-server:latest ./eureka-discovery-server

# Run containers
docker run -d -p 8761:8761 --name eureka eureka-server:latest
docker run -d -p 8081:8081 --name course-service course-service:latest
docker run -d -p 8082:8082 --name student-service student-service:latest
docker run -d -p 8083:8083 -e GCS_BUCKET_NAME=media-files \
  -e GCS_PROJECT_ID=your-project \
  -v /path/to/credentials.json:/app/credentials.json \
  --name media-service media-service:latest
docker run -d -p 8080:8080 --name api-gateway api-gateway:latest
```

#### 3. AWS ECS Deployment

See `media-service/DEPLOYMENT_EXAMPLES.md` for ECS task definition examples.

#### 4. Frontend Deployment

**Build for Production:**
```bash
cd frontend-app
npm run build
```

**Deploy to Static Hosting:**
- Netlify
- Vercel
- AWS S3 + CloudFront
- GitHub Pages

## 🔍 Troubleshooting

### Common Issues

**1. Eureka Server Not Starting**
- Check if port 8761 is already in use
- Verify Java version is 21+
- Check logs for configuration errors

**2. Services Not Registering with Eureka**
- Verify Eureka server URL in application.properties
- Check network connectivity
- Ensure Eureka server is running before starting other services

**3. GCS Authentication Failed**
- Verify `GOOGLE_APPLICATION_CREDENTIALS` environment variable
- Check service account permissions
- Ensure credentials file path is correct

**4. MongoDB Connection Failed**
- Verify MongoDB is running
- Check connection string in application.properties
- Ensure database user has correct permissions

**5. AWS RDS Connection Failed**
- Verify security group allows access
- Check database credentials
- Ensure RDS instance is in available state

### Debug Mode

Enable debug logging for troubleshooting:

```properties
# In application.properties
debug=true
logging.level.org.springframework.cloud=DEBUG
logging.level.com.google.cloud.storage=DEBUG
logging.level.lk.ise.eca=DEBUG
```

### Health Checks

Check service health:

```bash
# Eureka Dashboard
http://localhost:8761

# Service health endpoints (if actuator is enabled)
http://localhost:8081/actuator/health
http://localhost:8082/actuator/health
http://localhost:8083/actuator/health
```

## 📝 Project Structure

```
Cloud-Project/
├── api-gateway/                 # API Gateway Service
│   ├── src/
│   └── pom.xml
├── course-service/              # Course Management Service
│   ├── src/
│   │   └── main/
│   │       ├── resources/
│   │       │   ├── application.properties
│   │       │   ├── application-aws.properties
│   │       │   └── application-docker.properties
│   └── pom.xml
├── student-service/             # Student Management Service
│   ├── src/
│   │   └── main/
│   │       └── resources/
│   │           └── application.properties
│   └── pom.xml
├── media-service/               # Media File Management Service
│   ├── src/
│   │   └── main/
│   │       ├── resources/
│   │       │   └── application.properties
│   ├── GCS_CONFIGURATION.md    # GCS setup documentation
│   ├── DEPLOYMENT_EXAMPLES.md   # Deployment examples
│   └── pom.xml
├── eureka-discovery-server/    # Service Discovery Server
│   ├── src/
│   │   └── main/
│   │       └── resources/
│   │           └── application.yaml
│   └── pom.xml
├── frontend-app/                # React Frontend Application
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   └── App.tsx
│   ├── package.json
│   └── README.md
├── pom.xml                     # Parent POM
└── README.md                   # This file
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is part of the ECA Management System.

## 👥 Authors

- **Tharidi2002** - Project Owner

## 📞 Support

For issues and questions:
- Create an issue on GitHub
- Check existing documentation in service-specific folders
- Review troubleshooting section above

---

**Last Updated:** May 2026
**Version:** 1.0.0
