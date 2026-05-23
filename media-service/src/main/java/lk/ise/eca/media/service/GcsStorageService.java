package lk.ise.eca.media.service;

import com.google.cloud.storage.Blob;
import com.google.cloud.storage.BlobId;
import com.google.cloud.storage.BlobInfo;
import com.google.cloud.storage.Storage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.*;

@Service
public class GcsStorageService {

    private static final Logger logger = LoggerFactory.getLogger(GcsStorageService.class);

    @Value("${gcs.bucket-name}")
    private String bucketName;

    private final Storage storage;

    @Autowired
    public GcsStorageService(Storage storage) {
        this.storage = storage;
    }

    /**
     * Upload a file to Google Cloud Storage
     */
    public String uploadFile(MultipartFile file) throws IOException {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("File is empty");
        }

        String id = UUID.randomUUID().toString();
        String originalFilename = StringUtils.cleanPath(
                Objects.requireNonNullElse(file.getOriginalFilename(), "file")
        );
        String storedName = id + "__" + originalFilename;

        BlobId blobId = BlobId.of(bucketName, storedName);
        BlobInfo blobInfo = BlobInfo.newBuilder(blobId)
                .setContentType(file.getContentType())
                .build();

        try {
            storage.create(blobInfo, file.getBytes());
            logger.info("File uploaded successfully: {}", storedName);
            return id;
        } catch (IOException e) {
            logger.error("Failed to upload file to GCS: {}", storedName, e);
            throw new IOException("Failed to upload file to GCS", e);
        }
    }

    /**
     * Get file by ID
     */
    public byte[] getFile(String id) throws IOException {
        Optional<String> blobName = findBlobNameById(id);
        if (blobName.isEmpty()) {
            throw new IOException("File not found: " + id);
        }

        Blob blob = storage.get(BlobId.of(bucketName, blobName.get()));
        if (blob == null) {
            throw new IOException("File not found in GCS: " + id);
        }
        return blob.getContent();
    }

    /**
     * Get file metadata by ID
     */
    public Map<String, Object> getFileMetadata(String id) {
        Optional<String> blobName = findBlobNameById(id);
        if (blobName.isEmpty()) {
            return null;
        }

        Blob blob = storage.get(BlobId.of(bucketName, blobName.get()));
        if (blob == null) {
            return null;
        }

        String name = blob.getName();
        int idx = name.indexOf("__");
        String original = idx > 0 ? name.substring(idx + 2) : name;

        Map<String, Object> metadata = new LinkedHashMap<>();
        metadata.put("id", id);
        metadata.put("filename", original);
        metadata.put("size", blob.getSize());
        metadata.put("contentType", blob.getContentType());
        metadata.put("created", blob.getCreateTimeOffsetDateTime());
        return metadata;
    }

    /**
     * List all files
     */
    public List<Map<String, Object>> listFiles() {
        List<Map<String, Object>> files = new ArrayList<>();

        try {
            for (Blob blob : storage.list(bucketName).iterateAll()) {
                String name = blob.getName();
                int idx = name.indexOf("__");
                String id = idx > 0 ? name.substring(0, idx) : name;
                String original = idx > 0 ? name.substring(idx + 2) : name;

                Map<String, Object> metadata = new LinkedHashMap<>();
                metadata.put("id", id);
                metadata.put("filename", original);
                metadata.put("size", blob.getSize());
                metadata.put("contentType", blob.getContentType());
                files.add(metadata);
            }
        } catch (Exception e) {
            logger.error("Failed to list files from GCS", e);
        }

        return files;
    }

    /**
     * Delete file by ID
     */
    public boolean deleteFile(String id) throws IOException {
        Optional<String> blobName = findBlobNameById(id);
        if (blobName.isEmpty()) {
            return false;
        }

        try {
            boolean deleted = storage.delete(BlobId.of(bucketName, blobName.get()));
            if (deleted) {
                logger.info("File deleted successfully: {}", blobName.get());
            }
            return deleted;
        } catch (Exception e) {
            logger.error("Failed to delete file from GCS: {}", id, e);
            throw new IOException("Failed to delete file from GCS", e);
        }
    }

    /**
     * Find blob name by ID prefix
     */
    private Optional<String> findBlobNameById(String id) {
        try {
            for (Blob blob : storage.list(bucketName, Storage.BlobListOption.prefix(id + "__")).iterateAll()) {
                if (blob.getName().startsWith(id + "__")) {
                    return Optional.of(blob.getName());
                }
            }
        } catch (Exception e) {
            logger.error("Error searching for blob with ID: {}", id, e);
        }
        return Optional.empty();
    }

    /**
     * Get original filename by ID
     */
    public String getOriginalFilename(String id) throws IOException {
        Optional<String> blobName = findBlobNameById(id);
        if (blobName.isEmpty()) {
            throw new IOException("File not found: " + id);
        }

        String name = blobName.get();
        int idx = name.indexOf("__");
        return idx > 0 ? name.substring(idx + 2) : name;
    }
}
