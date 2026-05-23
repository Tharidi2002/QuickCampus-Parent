# Media Service - GCS Integration Update Summary

## Changes Made

### 1. **Updated pom.xml**
   - Added Google Cloud Storage dependency: `com.google.cloud:google-cloud-storage:2.30.0`

### 2. **New Files Created**

#### a) **GcsStorageService.java** (`src/main/java/lk/ise/eca/media/service/`)
   - Core service class for GCS operations
   - Methods:
     - `uploadFile()` - Upload files to GCS
     - `getFile()` - Retrieve file content from GCS
     - `getFileMetadata()` - Get file metadata (size, type, creation time)
     - `listFiles()` - List all files with metadata
     - `deleteFile()` - Delete file from GCS
     - `getOriginalFilename()` - Get original filename from stored name
     - `findBlobNameById()` - Find blob by ID prefix

#### b) **GcsConfig.java** (`src/main/java/lk/ise/eca/media/config/`)
   - Spring configuration class for Google Cloud Storage
   - Features:
     - Supports credentials from file path (`gcs.credentials-path`)
     - Supports default application credentials (env: `GOOGLE_APPLICATION_CREDENTIALS`)
     - Configurable project ID and bucket name
     - Conditional bean creation based on `storage.type=gcs`

#### c) **GCS_CONFIGURATION.md**
   - Comprehensive documentation for GCS setup
   - Includes:
     - Bucket creation steps
     - Authentication options (Service Account, ADC, Credentials Path)
     - Environment variable configuration
     - API endpoint examples
     - Docker deployment instructions
     - Kubernetes deployment examples
     - Troubleshooting guide

### 3. **Modified Files**

#### a) **FileController.java**
   - **Removed:**
     - Local file system imports and Path operations
     - `storageDir` initialization
     - Local file operations
   - **Added:**
     - GcsStorageService injection via constructor
     - All file operations now delegate to GcsStorageService
     - Updated endpoints:
       - `POST /files` - Upload file to GCS
       - `GET /files` - List files from GCS
       - `GET /files/{id}` - Download file from GCS
       - `DELETE /files/{id}` - Delete file from GCS

#### b) **MediaServiceApplication.java**
   - **Removed:**
     - WebMvcConfigurer interface implementation
     - `@Value` annotation for media storage directory
     - `addResourceHandlers()` method for local file serving
   - Result: Simplified to basic Spring Boot application

#### c) **application.properties**
   - **Removed:**
     - `media.storage.dir` property
   - **Added:**
     - `storage.type=gcs` - Storage backend selector
     - `gcs.bucket-name` - GCS bucket name (default: media-files)
     - `gcs.project-id` - GCP project ID
     - `gcs.credentials-path` - Path to GCS credentials JSON

## Environment Configuration

### Required Environment Variables
```bash
GCS_BUCKET_NAME          # GCS bucket name
GCS_PROJECT_ID           # GCP project ID (optional if using default credentials)
GOOGLE_APPLICATION_CREDENTIALS  # Path to service account key JSON (optional)
```

### Optional Environment Variables
```bash
GCS_CREDENTIALS_PATH    # Alternative path to credentials file
```

## API Compatibility

✅ **All existing API endpoints remain unchanged**

```bash
# Upload
POST /media-service/files

# List
GET /media-service/files

# Get File
GET /media-service/files/{id}

# Delete
DELETE /media-service/files/{id}
```

## Storage Mechanism

### File Naming in GCS
```
Bucket: media-files
File path: {uuid}__{original-filename}
Example: 550e8400-e29b-41d4-a716-446655440000__document.pdf
```

### Benefits
- Unique file IDs for efficient retrieval
- Preserves original filenames for user reference
- Prevents naming conflicts
- Enables easy file discovery by UUID

## Authentication Scenarios

### Scenario 1: Local Development with Service Account
```bash
export GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account-key.json
export GCS_BUCKET_NAME=media-files
export GCS_PROJECT_ID=my-project
java -jar media-service.jar
```

### Scenario 2: Cloud Run / Kubernetes with ADC
```yaml
env:
  - name: GCS_BUCKET_NAME
    value: media-files
  - name: GCS_PROJECT_ID
    value: my-project
  # Uses Workload Identity or default credentials
```

### Scenario 3: Docker with Mounted Credentials
```bash
docker run \
  -e GCS_BUCKET_NAME=media-files \
  -e GCS_PROJECT_ID=my-project \
  -e GOOGLE_APPLICATION_CREDENTIALS=/app/credentials.json \
  -v /path/to/credentials.json:/app/credentials.json \
  media-service:latest
```

## Logging Configuration

To enable debug logging for GCS operations:
```properties
logging.level.com.google.cloud.storage=DEBUG
logging.level.lk.ise.eca.media.service=DEBUG
logging.level.lk.ise.eca.media.config=DEBUG
```

## Performance Considerations

1. **Upload Performance**: Direct stream upload to GCS
2. **Download Performance**: Uses ByteArrayResource for efficient streaming
3. **Listing Performance**: Iterates through GCS bucket (consider pagination for large buckets)
4. **Deletion Performance**: Direct blob deletion via GCS API

## Error Handling

- All errors logged with comprehensive stack traces
- HTTP 400 - Empty file upload
- HTTP 404 - File not found
- HTTP 500 - GCS operation failures
- All exceptions wrapped with meaningful error messages

## Security

1. **Service Account based authentication** (recommended for production)
2. **No local file system exposure**
3. **Credentials stored outside application**
4. **GCS IAM policies enforce access control**

## Migration from Local Storage

### Steps to migrate existing files:
```bash
1. Export files from local storage
2. Create GCS bucket
3. Upload files via media-service endpoints OR use gsutil bulk upload
4. Verify file integrity
5. Deploy updated media-service
```

## Testing

### Test Upload
```bash
curl -F "file=@test-file.pdf" http://localhost:8083/media-service/files
```

### Test List
```bash
curl http://localhost:8083/media-service/files
```

### Test Download
```bash
curl http://localhost:8083/media-service/files/{id} -o downloaded-file.pdf
```

### Test Delete
```bash
curl -X DELETE http://localhost:8083/media-service/files/{id}
```

## Dependencies

### Added
- `com.google.cloud:google-cloud-storage:2.30.0`

### Removed (local storage no longer needed)
- Java NIO file operations

### Existing (unchanged)
- Spring Boot
- Spring Cloud
- Lombok
- Spring Validation

## Build & Deployment

### Build
```bash
# Parent directory
mvn clean install -DskipTests

# Or specific module
mvn clean package -pl media-service -DskipTests
```

### Run Locally
```bash
java -jar target/media-service-1.0.0.jar
```

### Docker Build
```bash
docker build -t media-service:latest .
```

## Next Steps

1. Set up GCS bucket and service account
2. Download service account key JSON
3. Configure environment variables
4. Test file upload/download/delete operations
5. Deploy to your environment

See `GCS_CONFIGURATION.md` for detailed setup instructions.

