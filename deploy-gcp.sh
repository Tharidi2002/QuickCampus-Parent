#!/bin/bash

# GCP Deployment Script for QuickCampus Mini
# This script deploys the entire microservices platform to GCP

PROJECT_ID="your-gcp-project-id"
REGION="us-central1"
ZONE="us-central1-a"

echo "Starting GCP deployment for QuickCampus Mini..."

# Step 1: Create VM Instance Template
echo "Creating VM instance template..."
gcloud compute instance-templates create quickcampus-backend-template \
    --machine-type=e2-medium \
    --image-family=ubuntu-2004-lts \
    --image-project=ubuntu-os-cloud \
    --boot-disk-size=50GB \
    --metadata-from-file startup-script=startup-script.sh \
    --tags=http-server,https-server,backend \
    --region=$REGION

# Step 2: Create Instance Group (Managed Instance Group)
echo "Creating managed instance group..."
gcloud compute instance-groups managed create quickcampus-backend-group \
    --base-instance-name=quickcampus-backend \
    --size=2 \
    --template=quickcampus-backend-template \
    --region=$REGION

# Step 3: Enable Auto-scaling
echo "Configuring auto-scaling..."
gcloud compute instance-groups managed set-autoscaling quickcampus-backend-group \
    --region=$REGION \
    --cool-down-period=60 \
    --min-num-replicas=2 \
    --max-num-replicas=5 \
    --target-cpu-utilization=0.6 \
    --mode=on

# Step 4: Create Health Check
echo "Creating health check..."
gcloud compute health-checks create http quickcampus-health-check \
    --port=8080 \
    --request-path=/actuator/health \
    --check-interval=30s \
    --timeout=10s \
    --unhealthy-threshold=3 \
    --healthy-threshold=2

# Step 5: Attach Health Check to Instance Group
echo "Attaching health check to instance group..."
gcloud compute instance-groups managed update quickcampus-backend-group \
    --region=$REGION \
    --health-check=quickcampus-health-check \
    --initial-delay=300s

# Step 6: Create Load Balancer
echo "Creating load balancer..."
gcloud compute forwarding-rules create quickcampus-lb-forwarding-rule \
    --region=$REGION \
    --address=quickcampus-lb-ip \
    --ports=80 \
    --target-http-proxy=quickcampus-http-proxy

gcloud compute target-http-proxies create quickcampus-http-proxy \
    --url-map=quickcampus-url-map

gcloud compute url-maps create quickcampus-url-map \
    --default-service=quickcampus-backend-group

# Step 7: Configure Firewall Rules
echo "Configuring firewall rules..."
gcloud compute firewall-rules create allow-http \
    --allow tcp:80 \
    --target-tags=http-server \
    --source-ranges 0.0.0.0/0

gcloud compute firewall-rules create allow-backend \
    --allow tcp:8080,tcp:8081,tcp:8082,tcp:8761,tcp:8888 \
    --target-tags=backend \
    --source-ranges 0.0.0.0/0

# Step 8: Get Load Balancer IP
echo "Getting load balancer IP..."
LB_IP=$(gcloud compute forwarding-rules describe quickcampus-lb-forwarding-rule \
    --region=$REGION \
    --format='get(IPAddress)')

echo "Deployment completed!"
echo "Load Balancer IP: $LB_IP"
echo "Your application should be available at: http://$LB_IP"

# Step 9: Deploy Frontend to Cloud Run
echo "Deploying frontend to Cloud Run..."
cd frontend

# Build and deploy frontend
gcloud builds submit --tag gcr.io/$PROJECT_ID/quickcampus-frontend

gcloud run deploy quickcampus-frontend \
    --image gcr.io/$PROJECT_ID/quickcampus-frontend \
    --platform managed \
    --region=$REGION \
    --allow-unauthenticated \
    --port=8080

FRONTEND_URL=$(gcloud run services describe quickcampus-frontend \
    --platform managed \
    --region=$REGION \
    --format='value(status.url)')

echo "Frontend deployed at: $FRONTEND_URL"

cd ..

echo "Full deployment completed!"
echo "Backend Load Balancer: http://$LB_IP"
echo "Frontend Cloud Run: $FRONTEND_URL"
