# GCP Setup Guide for QuickCampus Mini

## Step 1: Create GCP Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (e.g., "quickcampus-mini")
3. Note your Project ID - you'll need it for configuration

## Step 2: Enable Required APIs
Run these commands in Cloud Shell or gcloud CLI:

```bash
# Enable required APIs
gcloud services enable compute.googleapis.com
gcloud services enable sql-component.googleapis.com
gcloud services enable sqladmin.googleapis.com
gcloud services enable firestore.googleapis.com
gcloud services enable storage-component.googleapis.com
gcloud services enable storage-api.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable cloudbuild.googleapis.com
gcloud services enable iam.googleapis.com
gcloud services enable dns.googleapis.com
```

## Step 3: Set Up Cloud Storage Bucket
```bash
# Create bucket for profile images
gsutil mb gs://quickcampus-profile-images

# Make bucket public (for profile images)
gsutil iam ch allUsers:objectViewer gs://quickcampus-profile-images
```

## Step 4: Set Up Cloud SQL (MySQL)
```bash
# Create MySQL instance
gcloud sql instances create quickcampus-mysql \
    --database-version=MYSQL_8_0 \
    --tier=db-n1-standard-1 \
    --region=us-central1 \
    --storage-auto-increase \
    --storage-size=10GB

# Create database
gcloud sql databases create quickcampus_student \
    --instance=quickcampus-mysql

# Create user
gcloud sql users create quickcampus_user \
    --instance=quickcampus-mysql \
    --password=your-secure-password
```

## Step 5: Set Up MongoDB (Compute Engine VM)
```bash
# Create VM for MongoDB
gcloud compute instances create quickcampus-mongodb \
    --machine-type=e2-medium \
    --image-family=ubuntu-2004-lts \
    --image-project=ubuntu-os-cloud \
    --zone=us-central1-a \
    --boot-disk-size=20GB

# SSH into VM and install MongoDB
gcloud compute ssh quickcampus-mongodb --zone=us-central1-a

# Inside VM:
sudo apt update
sudo apt install -y mongodb
sudo systemctl start mongodb
sudo systemctl enable mongodb
```

## Step 6: Create Service Account
```bash
# Create service account for application
gcloud iam service-accounts create quickcampus-app \
    --display-name="QuickCampus Application"

# Grant necessary roles
gcloud projects add-iam-policy-binding your-project-id \
    --member="serviceAccount:quickcampus-app@your-project-id.iam.gserviceaccount.com" \
    --role="roles/storage.objectAdmin"

gcloud projects add-iam-policy-binding your-project-id \
    --member="serviceAccount:quickcampus-app@your-project-id.iam.gserviceaccount.com" \
    --role="roles/compute.instanceAdmin"

# Create and download key
gcloud iam service-accounts keys create ~/key.json \
    --iam-account=quickcampus-app@your-project-id.iam.gserviceaccount.com
```

## Step 7: Update Configuration Files
Replace placeholders in your configuration files:
- `your-gcp-project-id` → Your actual GCP Project ID
- `your-secure-password` → Your MySQL password
- Update database URLs with Cloud SQL instance connection name

## Step 8: Build and Deploy
Run the deployment scripts provided in the project.

## Important Notes:
- Replace all placeholder values with your actual GCP project details
- Ensure firewall rules allow traffic on required ports (8080, 8081, 8082, 8761, 8888)
- Set up proper VPC networking for secure communication
- Configure auto-scaling and load balancing as shown in deployment scripts
