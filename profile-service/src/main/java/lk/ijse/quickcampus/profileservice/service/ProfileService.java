package lk.ijse.quickcampus.profileservice.service;

import com.google.cloud.storage.Blob;
import com.google.cloud.storage.BlobId;
import com.google.cloud.storage.BlobInfo;
import com.google.cloud.storage.Storage;
import lk.ijse.quickcampus.profileservice.entity.Profile;
import lk.ijse.quickcampus.profileservice.repository.ProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ProfileService {
    
    private final ProfileRepository profileRepository;
    private final Storage storage;
    
    @Value("${gcp.bucket.name}")
    private String bucketName;
    
    public Optional<Profile> getProfileByStudentId(Long studentId) {
        return profileRepository.findByStudentId(studentId);
    }
    
    public Profile createProfile(Profile profile) {
        if (profileRepository.existsByStudentId(profile.getStudentId())) {
            throw new RuntimeException("Profile for student ID " + profile.getStudentId() + " already exists");
        }
        return profileRepository.save(profile);
    }
    
    public Profile updateProfile(Long studentId, Profile profileDetails) {
        return profileRepository.findByStudentId(studentId)
                .map(profile -> {
                    profile.setFirstName(profileDetails.getFirstName());
                    profile.setLastName(profileDetails.getLastName());
                    profile.setBio(profileDetails.getBio());
                    return profileRepository.save(profile);
                })
                .orElseThrow(() -> new RuntimeException("Profile not found for student ID: " + studentId));
    }
    
    public void deleteProfile(Long studentId) {
        Profile profile = profileRepository.findByStudentId(studentId)
                .orElseThrow(() -> new RuntimeException("Profile not found for student ID: " + studentId));
        
        if (profile.getFileName() != null) {
            storage.delete(BlobId.of(bucketName, profile.getFileName()));
        }
        
        profileRepository.delete(profile);
    }
    
    public String uploadProfileImage(Long studentId, MultipartFile file) throws IOException {
        if (file.isEmpty()) {
            throw new RuntimeException("File is empty");
        }
        
        String fileName = "profile-images/" + studentId + "/" + UUID.randomUUID() + "-" + file.getOriginalFilename();
        
        BlobInfo blobInfo = BlobInfo.newBuilder(bucketName, fileName)
                .setContentType(file.getContentType())
                .build();
        
        Blob blob = storage.create(blobInfo, file.getBytes());
        
        String publicUrl = "https://storage.googleapis.com/" + bucketName + "/" + fileName;
        
        Profile profile = profileRepository.findByStudentId(studentId)
                .orElse(new Profile());
        
        profile.setStudentId(studentId);
        profile.setProfileImageUrl(publicUrl);
        profile.setCloudStorageUrl(fileName);
        profile.setFileName(fileName);
        profile.setContentType(file.getContentType());
        profile.setFileSize((long) file.getSize());
        
        profileRepository.save(profile);
        
        return publicUrl;
    }
}
