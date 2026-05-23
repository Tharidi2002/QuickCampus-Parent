package lk.ise.eca.media.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.cloud.storage.Storage;
import com.google.cloud.storage.StorageOptions;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.io.FileInputStream;
import java.io.IOException;

@Configuration
@ConditionalOnProperty(
        name = "storage.type",
        havingValue = "gcs",
        matchIfMissing = true
)
public class GcsConfig {

    private static final Logger logger = LoggerFactory.getLogger(GcsConfig.class);

    @Value("${gcs.credentials-path:}")
    private String credentialsPath;

    @Value("${gcs.project-id:}")
    private String projectId;

    @Bean
    public Storage googleCloudStorage() throws IOException {
        StorageOptions.Builder builder = StorageOptions.newBuilder();

        // Set credentials if path is provided
        if (credentialsPath != null && !credentialsPath.isEmpty()) {
            try {
                GoogleCredentials credentials = GoogleCredentials.fromStream(
                        new FileInputStream(credentialsPath)
                );
                builder.setCredentials(credentials);
                logger.info("GCS credentials loaded from: {}", credentialsPath);
            } catch (IOException e) {
                logger.error("Failed to load GCS credentials from path: {}", credentialsPath, e);
                throw new IOException("Failed to load GCS credentials", e);
            }
        } else {
            // Use default application credentials (env var: GOOGLE_APPLICATION_CREDENTIALS)
            GoogleCredentials credentials = GoogleCredentials.getApplicationDefault();
            builder.setCredentials(credentials);
            logger.info("Using default GCS credentials from environment");
        }

        // Set project ID if provided
        if (projectId != null && !projectId.isEmpty()) {
            builder.setProjectId(projectId);
        }

        return builder.build().getService();
    }
}
