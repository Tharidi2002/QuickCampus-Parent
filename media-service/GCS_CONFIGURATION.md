# Media Service - Google Cloud Storage Configuration

## Overview
The media-service has been updated to save all files to Google Cloud Storage (GCS) instead of local file system.

## Setup Instructions

### 1. Create a GCS Bucket
First, create a Google Cloud Storage bucket:

```bash
gsutil mb gs://media-files
```

Or use the Google Cloud Console: https://console.cloud.google.com/storage/browser

### 2. Set Up Authentication

#### Option A: Using Service Account (Recommended for Production)

1. Create a service account:
```bash
gcloud iam service-accounts create media-service-sa \
  --description="Service account for media-service" \
  --display-name="Media Service"
```

2. Grant permissions:
```bash
gcloud projects add-iam-policy-binding PROJECT_ID \
  --member="serviceAccount:media-service-sa@PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/storage.objectAdmin"
```

3. Create and download a JSON key:
```bash
gcloud iam service-accounts keys create media-service-key.json \
  --iam-account=media-service-sa@PROJECT_ID.iam.gserviceaccount.com
```

4. Set environment variable:
```bash
export GOOGLE_APPLICATION_CREDENTIALS=/path/to/media-service-key.json
```

#### Option B: Using Application Default Credentials

If running on Google Cloud (App Engine, Cloud Run, Compute Engine), set up ADC:
```bash
gcloud auth application-default login
```

#### Option C: Using Credentials Path
Provide the path to credentials file via environment variable:
```bash
export GCS_CREDENTIALS_PATH=/path/to/credentials.json
```

### 3. Configure Environment Variables

Set the following environment variables:

```bash
export GCS_BUCKET_NAME=media-files
export GCS_PROJECT_ID=your-project-id
export GCS_CREDENTIALS_PATH=/path/to/credentials.json  # Optional
```

Or configure in `application.properties`:
```properties
gcs.bucket-name=media-files
gcs.project-id=your-project-id
gcs.credentials-path=/path/to/credentials.json
```

### 4. Run the Service

```bash
mvn clean install
mvn spring-boot:run
```

## API Endpoints

All endpoints remain the same:

### Upload File
```bash
curl -X POST -F "file=@/path/to/file" http://localhost:8083/media-service/files
```

Response:
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "filename": "document.pdf",
  "url": "http://localhost:8083/media-service/files/550e8400-e29b-41d4-a716-446655440000-document.pdf"
}
```

### List Files
```bash
curl http://localhost:8083/media-service/files
```

### Get File
```bash
curl http://localhost:8083/media-service/files/{id}
```

### Delete File
```bash
curl -X DELETE http://localhost:8083/media-service/files/{id}
```

## Docker Deployment

### Build Docker Image
```bash
docker build -t media-service:latest .
```

### Run Docker Container
```bash
docker run -e GCS_BUCKET_NAME=media-files \
           -e GCS_PROJECT_ID=your-project-id \
           -e GOOGLE_APPLICATION_CREDENTIALS=/app/credentials.json \
           -v /path/to/credentials.json:/app/credentials.json \
           -p 8083:8083 \
           media-service:latest
```

## Kubernetes Deployment

### Create Secret with GCS Credentials
```bash
kubectl create secret generic gcs-credentials \
  --from-file=credentials.json=/path/to/credentials.json
```

### Example Deployment YAML
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: media-service
spec:
  replicas: 2
  selector:
    matchLabels:
      app: media-service
  template:
    metadata:
      labels:
        app: media-service
    spec:
      containers:
      - name: media-service
        image: media-service:latest
        ports:
        - containerPort: 8083
        env:
        - name: GCS_BUCKET_NAME
          value: "media-files"
        - name: GCS_PROJECT_ID
          value: "your-project-id"
        - name: GOOGLE_APPLICATION_CREDENTIALS
          value: "/app/credentials.json"
        volumeMounts:
        - name: gcs-credentials
          mountPath: /app
          readOnly: true
      volumes:
      - name: gcs-credentials
        secret:
          secretName: gcs-credentials
```

## Dependencies Added

- `google-cloud-storage:2.30.0` - Google Cloud Storage client library

## File Naming Convention

Files in GCS are stored with the following naming convention:
```
{uuid}__{original-filename}
```

Example: `550e8400-e29b-41d4-a716-446655440000__document.pdf`

This allows efficient searching by ID while preserving the original filename.

## Features

✅ **File Upload** - Upload files to GCS
✅ **File Download** - Download files from GCS
✅ **File Listing** - List all files with metadata
✅ **File Deletion** - Delete files from GCS
✅ **File Metadata** - View file size, content type, creation time
✅ **Service Discovery** - Integrated with Eureka
✅ **Error Handling** - Comprehensive error handling and logging

## Troubleshooting

### Issue: "Failed to load GCS credentials"
- Ensure credentials file path is correct
- Verify service account has necessary permissions
- Check `GOOGLE_APPLICATION_CREDENTIALS` environment variable

### Issue: "Bucket not found"
- Verify bucket name is correct
- Check if bucket exists in your GCP project
- Ensure service account has access to the bucket

### Issue: "Permission denied"
- Add `roles/storage.objectAdmin` role to service account
- Or use more specific role: `roles/storage.objectCreator`, `roles/storage.objectViewer`

## Logging

Enable debug logging for GCS:
```properties
logging.level.com.google.cloud.storage=DEBUG
```

## Performance Tips

1. **Use Cloud Storage buckets in the same region** as your application
2. **Enable versioning** for backup and rollback capabilities
3. **Use lifecycle policies** to archive or delete old files
4. **Enable CDN** for faster file delivery to end users
5. **Consider using signed URLs** for temporary file access

## Cost Optimization

1. **Storage classes** - Use Standard for frequent access, Nearline/Coldline for archival
2. **Lifecycle management** - Automatically transition files to cheaper storage classes
3. **Regional buckets** - Use regional buckets instead of multi-region for cost savings

