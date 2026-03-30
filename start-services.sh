#!/bin/bash

# QuickCampus Mini - PM2 Startup Script
# This script starts all microservices using PM2

echo "Starting QuickCampus Mini microservices..."

# Create logs directory if it doesn't exist
mkdir -p logs

# Build all services first
echo "Building all services..."
mvn clean package -DskipTests

# Start all services with PM2
echo "Starting services with PM2..."
pm2 start ecosystem.config.json

# Save PM2 configuration
pm2 save

# Setup PM2 to start on system boot
pm2 startup

echo "QuickCampus Mini microservices started successfully!"
echo "Check status with: pm2 status"
echo "View logs with: pm2 logs"
echo "Stop services with: pm2 stop ecosystem.config.json"
