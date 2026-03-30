#!/bin/bash

# Startup Script for QuickCampus Backend VM Instances
# This script runs automatically when VM instances start

echo "Starting QuickCampus Backend setup..."

# Update system
apt-get update -y

# Install Java 25
echo "Installing Java 25..."
wget https://download.oracle.com/java/25/latest/jdk-25_linux-x64_bin.tar.gz
tar -xzf jdk-25_linux-x64_bin.tar.gz
mv jdk-25 /opt/java
echo 'export JAVA_HOME=/opt/java' >> /etc/environment
echo 'export PATH=$PATH:/opt/java/bin' >> /etc/environment
source /etc/environment

# Install Maven
echo "Installing Maven..."
apt-get install -y maven

# Install Node.js and PM2
echo "Installing Node.js and PM2..."
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt-get install -y nodejs
npm install -g pm2

# Install MySQL Client
echo "Installing MySQL Client..."
apt-get install -y mysql-client

# Create application directory
mkdir -p /opt/quickcampus
cd /opt/quickcampus

# Clone application code (replace with your repository)
echo "Cloning application code..."
git clone https://github.com/your-username/quickcampus-backend.git .

# Build application
echo "Building application..."
mvn clean package -DskipTests

# Create logs directory
mkdir -p logs

# Setup PM2 to start on boot
pm2 startup

# Copy service account key (if using GCP services)
# This should be done securely - either through metadata or secure copy
# echo "Copying service account key..."
# gcloud secrets versions access latest --secret=quickcampus-service-account-key > /opt/quickcampus/key.json

# Start services with PM2
echo "Starting microservices..."
pm2 start ecosystem.config.json
pm2 save

# Setup monitoring
echo "Setting up monitoring..."
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 30

echo "QuickCampus Backend setup completed!"
echo "Services should be running and accessible through the load balancer."
