package com.tpl.tupalle.services;

import com.tpl.tupalle.entity.User;
import com.tpl.tupalle.entity.Share;
import com.tpl.tupalle.repositories.UserRepository;
import com.tpl.tupalle.repositories.ShareRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UserService {
    
    private final UserRepository userRepository;
    private final ShareRepository shareRepository;
    
    public Optional<User> findByUsername(String username) {
        return userRepository.findByUsername(username);
    }
    
    public Optional<User> findById(Long id) {
        return userRepository.findById(id);
    }
    
    @Transactional
    public void updateUserTitle(String username) {
        Optional<User> userOpt = userRepository.findByUsername(username);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            
            // Calculate total likes from user's shares
            long totalLikes = shareRepository.findByOwnerUsername(username)
                .stream()
                .mapToLong(Share::getLikeCount)
                .sum();
            
            // Determine title based on total likes
            String title = determineTitle(totalLikes);
            user.setTitle(title);
            userRepository.save(user);
        }
    }
    
    @Transactional
    public void updateUserTitle(Long userId) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            
            // Calculate total likes from user's shares
            long totalLikes = shareRepository.findByOwnerUsername(user.getUsername())
                .stream()
                .mapToLong(Share::getLikeCount)
                .sum();
            
            // Determine title based on total likes
            String title = determineTitle(totalLikes);
            user.setTitle(title);
            userRepository.save(user);
        }
    }
    
    private String determineTitle(long totalLikes) {
        if (totalLikes >= 50) {
            return "Code Master";
        } else if (totalLikes >= 5) {
            return "Code Enthusiast";
        } else {
            return "Newbie Coder";
        }
    }
    
    public long getTotalLikesForUser(String username) {
        return shareRepository.findByOwnerUsername(username)
            .stream()
            .mapToLong(Share::getLikeCount)
            .sum();
    }
}
