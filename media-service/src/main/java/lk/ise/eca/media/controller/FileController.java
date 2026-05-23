package lk.ise.eca.media.controller;

import lk.ise.eca.media.service.GcsStorageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.io.IOException;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;

@RestController
@CrossOrigin
@RequestMapping("/files")
public class FileController {

    private final GcsStorageService gcsStorageService;

    @Autowired
    public FileController(GcsStorageService gcsStorageService) {
        this.gcsStorageService = gcsStorageService;
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Map<String, Object>> upload(@RequestPart("file") MultipartFile file) {
        try {
            if (file.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "empty file"));
            }

            String id = gcsStorageService.uploadFile(file);
            String filename = Objects.requireNonNullElse(file.getOriginalFilename(), id);

            Map<String, Object> resp = new LinkedHashMap<>();
            resp.put("id", id);
            resp.put("filename", filename);
            resp.put("url", ServletUriComponentsBuilder
                    .fromCurrentContextPath()
                    .path("/files/{id}")
                    .buildAndExpand(id)
                    .toUriString());
            return ResponseEntity.ok(resp);
        } catch (IOException e) {
            return ResponseEntity.internalServerError().body(Map.of("error", "failed to store file"));
        }
    }

    @GetMapping
    public List<Map<String, Object>> list() {
        return gcsStorageService.listFiles().stream().map(file -> {
            Map<String, Object> withUrl = new LinkedHashMap<>(file);
            Object id = file.get("id");
            if (id != null) {
                withUrl.put("url", ServletUriComponentsBuilder
                        .fromCurrentContextPath()
                        .path("/files/{id}")
                        .buildAndExpand(id.toString())
                        .toUriString());
            }
            return withUrl;
        }).toList();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Resource> getOne(@PathVariable String id) {
        try {
            byte[] fileContent = gcsStorageService.getFile(id);
            String filename = gcsStorageService.getOriginalFilename(id);
            Map<String, Object> metadata = gcsStorageService.getFileMetadata(id);
            String contentType = metadata != null ? (String) metadata.get("contentType") : null;

            Resource resource = new ByteArrayResource(fileContent);
            MediaType mediaType = (contentType == null || contentType.isBlank())
                    ? MediaType.APPLICATION_OCTET_STREAM
                    : MediaType.parseMediaType(contentType);

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + filename + "\"")
                    .contentType(mediaType)
                    .body(resource);
        } catch (IOException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        try {
            if (gcsStorageService.deleteFile(id)) {
                return ResponseEntity.noContent().build();
            }
            return ResponseEntity.notFound().build();
        } catch (IOException e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}
