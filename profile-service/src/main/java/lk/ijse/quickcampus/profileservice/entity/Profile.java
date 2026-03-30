package lk.ijse.quickcampus.profileservice.entity;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "profiles")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Profile {
    
    @Id
    private String id;
    
    private Long studentId;
    
    private String firstName;
    
    private String lastName;
    
    private String bio;
    
    private String profileImageUrl;
    
    private String cloudStorageUrl;
    
    private String fileName;
    
    private String contentType;
    
    private Long fileSize;
}
