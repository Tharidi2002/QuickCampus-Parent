package lk.ijse.quickcampus.profileservice.repository;

import lk.ijse.quickcampus.profileservice.entity.Profile;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ProfileRepository extends MongoRepository<Profile, String> {
    
    Optional<Profile> findByStudentId(Long studentId);
    
    boolean existsByStudentId(Long studentId);
}
