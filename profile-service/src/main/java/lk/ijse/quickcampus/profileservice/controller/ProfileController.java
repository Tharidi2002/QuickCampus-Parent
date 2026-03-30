package lk.ijse.quickcampus.profileservice.controller;

import lk.ijse.quickcampus.profileservice.entity.Profile;
import lk.ijse.quickcampus.profileservice.service.ProfileService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/api/profiles")
@RequiredArgsConstructor
public class ProfileController {
    
    private final ProfileService profileService;
    
    @GetMapping("/student/{studentId}")
    public ResponseEntity<Profile> getProfileByStudentId(@PathVariable Long studentId) {
        return profileService.getProfileByStudentId(studentId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    @PostMapping
    public ResponseEntity<Profile> createProfile(@RequestBody Profile profile) {
        try {
            Profile createdProfile = profileService.createProfile(profile);
            return ResponseEntity.ok(createdProfile);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @PutMapping("/student/{studentId}")
    public ResponseEntity<Profile> updateProfile(@PathVariable Long studentId, @RequestBody Profile profile) {
        try {
            Profile updatedProfile = profileService.updateProfile(studentId, profile);
            return ResponseEntity.ok(updatedProfile);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    @DeleteMapping("/student/{studentId}")
    public ResponseEntity<Void> deleteProfile(@PathVariable Long studentId) {
        try {
            profileService.deleteProfile(studentId);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    @PostMapping("/student/{studentId}/upload-image")
    public ResponseEntity<Map<String, String>> uploadProfileImage(
            @PathVariable Long studentId,
            @RequestParam("file") MultipartFile file) {
        try {
            String imageUrl = profileService.uploadProfileImage(studentId, file);
            return ResponseEntity.ok(Map.of("imageUrl", imageUrl));
        } catch (RuntimeException | IOException e) {
            return ResponseEntity.badRequest().build();
        }
    }
}
