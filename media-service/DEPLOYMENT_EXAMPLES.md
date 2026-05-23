# Media Service - Environment Configuration Examples

## Development Environment (.env)
```
# Google Cloud Storage Configuration
GCS_BUCKET_NAME=media-files-dev
GCS_PROJECT_ID=my-project-dev
GCS_CREDENTIALS_PATH=/path/to/service-account-dev.json

# Server Configuration
SERVER_PORT=8083
SPRING_APPLICATION_NAME=media-service

# Eureka Configuration
EUREKA_CLIENT_SERVICE_URL_DEFAULT_ZONE=http://localhost:8761/eureka/
```

## Production Environment (.env.prod)
```
# Google Cloud Storage Configuration
GCS_BUCKET_NAME=media-files-prod
GCS_PROJECT_ID=my-project-prod
GCS_CREDENTIALS_PATH=/secrets/gcs-credentials.json

# Server Configuration
SERVER_PORT=8083
SPRING_APPLICATION_NAME=media-service
SERVER_SHUTDOWN=graceful
SPRING_LIFECYCLE_TIMEOUT_PER_SHUTDOWN_PHASE=30s

# Eureka Configuration
EUREKA_CLIENT_SERVICE_URL_DEFAULT_ZONE=http://eureka-server:8761/eureka/
EUREKA_INSTANCE_PREFER_IP_ADDRESS=true
EUREKA_INSTANCE_IP_ADDRESS=0.0.0.0

# Logging
LOGGING_LEVEL_ROOT=INFO
LOGGING_LEVEL_COM_GOOGLE_CLOUD_STORAGE=INFO
LOGGING_LEVEL_LK_ISE_ECA_MEDIA=INFO

# Performance
SERVER_TOMCAT_THREADS_MAX=200
SERVER_TOMCAT_THREADS_MIN_SPARE=50
```

## Docker Compose Example (docker-compose.yml)
```yaml
version: '3.8'

services:
  media-service:
    build:
      context: ./media-service
      dockerfile: Dockerfile
    container_name: media-service
    ports:
      - "8083:8083"
    environment:
      - GCS_BUCKET_NAME=media-files
      - GCS_PROJECT_ID=my-project
      - GOOGLE_APPLICATION_CREDENTIALS=/app/credentials.json
      - EUREKA_CLIENT_SERVICE_URL_DEFAULT_ZONE=http://eureka:8761/eureka/
      - SPRING_APPLICATION_NAME=media-service
    volumes:
      - /path/to/service-account-key.json:/app/credentials.json:ro
    depends_on:
      - eureka
    networks:
      - microservices

  eureka:
    image: eureka-discovery-server:latest
    container_name: eureka
    ports:
      - "8761:8761"
    networks:
      - microservices

networks:
  microservices:
    driver: bridge
```

## Kubernetes ConfigMap and Secret Example

### secrets.yaml
```yaml
apiVersion: v1
kind: Secret
metadata:
  name: gcs-credentials
  namespace: microservices
type: Opaque
data:
  # Base64 encoded service account JSON key
  # Create with: cat service-account-key.json | base64
  credentials.json: <base64-encoded-json>
```

### configmap.yaml
```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: media-service-config
  namespace: microservices
data:
  GCS_BUCKET_NAME: "media-files"
  GCS_PROJECT_ID: "my-project"
  SPRING_APPLICATION_NAME: "media-service"
  EUREKA_CLIENT_SERVICE_URL_DEFAULT_ZONE: "http://eureka:8761/eureka/"
  EUREKA_INSTANCE_PREFER_IP_ADDRESS: "true"
  LOGGING_LEVEL_ROOT: "INFO"
  LOGGING_LEVEL_COM_GOOGLE_CLOUD_STORAGE: "INFO"
```

### deployment.yaml
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: media-service
  namespace: microservices
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
      serviceAccountName: media-service
      containers:
      - name: media-service
        image: media-service:latest
        imagePullPolicy: Always
        ports:
        - containerPort: 8083
          name: http
        env:
        - name: GOOGLE_APPLICATION_CREDENTIALS
          value: /etc/secrets/gcs/credentials.json
        envFrom:
        - configMapRef:
            name: media-service-config
        resources:
          requests:
            memory: "512Mi"
            cpu: "250m"
          limits:
            memory: "1Gi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /actuator/health
            port: 8083
          initialDelaySeconds: 30
          periodSeconds: 10
          timeoutSeconds: 5
          failureThreshold: 3
        readinessProbe:
          httpGet:
            path: /actuator/health/readiness
            port: 8083
          initialDelaySeconds: 20
          periodSeconds: 5
          timeoutSeconds: 5
          failureThreshold: 3
        volumeMounts:
        - name: gcs-credentials
          mountPath: /etc/secrets/gcs
          readOnly: true
      volumes:
      - name: gcs-credentials
        secret:
          secretName: gcs-credentials
```

### service.yaml
```yaml
apiVersion: v1
kind: Service
metadata:
  name: media-service
  namespace: microservices
  labels:
    app: media-service
spec:
  type: ClusterIP
  ports:
  - port: 8083
    targetPort: 8083
    protocol: TCP
    name: http
  selector:
    app: media-service
```

## AWS ECS Task Definition Example (ecs-task-definition.json)
```json
{
  "family": "media-service",
  "taskRoleArn": "arn:aws:iam::ACCOUNT:role/media-service-task-role",
  "executionRoleArn": "arn:aws:iam::ACCOUNT:role/media-service-task-execution-role",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "512",
  "memory": "1024",
  "containerDefinitions": [
    {
      "name": "media-service",
      "image": "ACCOUNT.dkr.ecr.REGION.amazonaws.com/media-service:latest",
      "portMappings": [
        {
          "containerPort": 8083,
          "hostPort": 8083,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "GCS_BUCKET_NAME",
          "value": "media-files"
        },
        {
          "name": "GCS_PROJECT_ID",
          "value": "my-project"
        },
        {
          "name": "SPRING_APPLICATION_NAME",
          "value": "media-service"
        }
      ],
      "secrets": [
        {
          "name": "GOOGLE_APPLICATION_CREDENTIALS",
          "valueFrom": "arn:aws:secretsmanager:REGION:ACCOUNT:secret:gcs-credentials:credentials.json::"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/media-service",
          "awslogs-region": "REGION",
          "awslogs-stream-prefix": "ecs"
        }
      },
      "healthCheck": {
        "command": [
          "CMD-SHELL",
          "curl -f http://localhost:8083/actuator/health || exit 1"
        ],
        "interval": 30,
        "timeout": 5,
        "retries": 3,
        "startPeriod": 30
      }
    }
  ]
}
```

## Spring Properties Application Configuration

### application-prod.properties
```properties
# Server Configuration
server.port=8083
server.shutdown=graceful
spring.lifecycle.timeout-per-shutdown-phase=30s

# Spring Application
spring.application.name=media-service

# GCS Configuration
storage.type=gcs
gcs.bucket-name=${GCS_BUCKET_NAME:media-files}
gcs.project-id=${GCS_PROJECT_ID:}
gcs.credentials-path=${GCS_CREDENTIALS_PATH:}

# Eureka Configuration
eureka.client.service-url.default-zone=${EUREKA_URL:http://localhost:8761/eureka/}
eureka.instance.prefer-ip-address=true
eureka.instance.ip-address=${SERVER_IP:}

# Logging
logging.level.root=INFO
logging.level.com.google.cloud=INFO
logging.level.lk.ise.eca.media=INFO

# Actuator
management.endpoints.web.exposure.include=health,info
management.endpoint.health.show-details=when-authorized
```

### application-dev.properties
```properties
# Server Configuration
server.port=8083
debug=true

# Spring Application
spring.application.name=media-service

# GCS Configuration
storage.type=gcs
gcs.bucket-name=media-files-dev
gcs.project-id=my-project-dev
gcs.credentials-path=/path/to/service-account-dev.json

# Eureka Configuration
eureka.client.service-url.default-zone=http://localhost:8761/eureka/
eureka.instance.prefer-ip-address=false

# Logging
logging.level.root=DEBUG
logging.level.com.google.cloud=DEBUG
logging.level.lk.ise.eca.media=DEBUG

# Actuator
management.endpoints.web.exposure.include=*
management.endpoint.health.show-details=always
```

## Deployment Commands

### Docker
```bash
# Build
docker build -t media-service:latest .

# Run
docker run -e GCS_BUCKET_NAME=media-files \
           -e GCS_PROJECT_ID=my-project \
           -e GOOGLE_APPLICATION_CREDENTIALS=/app/credentials.json \
           -v /path/to/credentials.json:/app/credentials.json \
           -p 8083:8083 \
           media-service:latest
```

### Kubernetes
```bash
# Create namespace
kubectl create namespace microservices

# Create secret
kubectl create secret generic gcs-credentials \
  --from-file=credentials.json=/path/to/service-account-key.json \
  -n microservices

# Apply configurations
kubectl apply -f configmap.yaml
kubectl apply -f secrets.yaml
kubectl apply -f deployment.yaml
kubectl apply -f service.yaml

# Verify deployment
kubectl get pods -n microservices
kubectl logs -f deployment/media-service -n microservices
```

### AWS ECS
```bash
# Register task definition
aws ecs register-task-definition \
  --cli-input-json file://ecs-task-definition.json \
  --region REGION

# Create service
aws ecs create-service \
  --cluster media-cluster \
  --service-name media-service \
  --task-definition media-service:1 \
  --desired-count 2 \
  --region REGION
```

