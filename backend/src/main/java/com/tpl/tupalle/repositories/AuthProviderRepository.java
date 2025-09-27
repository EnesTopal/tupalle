package com.tpl.tupalle.repositories;

import com.tpl.tupalle.entity.AuthProvider;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface AuthProviderRepository extends JpaRepository<AuthProvider, Long> {
    
    /**
     * Find auth provider by provider name and provider ID (sub)
     */
    Optional<AuthProvider> findByProviderAndProviderId(String provider, String providerId);
    
    /**
     * Find auth provider by provider name and email
     */
    Optional<AuthProvider> findByProviderAndProviderEmail(String provider, String providerEmail);
    
    /**
     * Find all auth providers linked to a specific user
     */
    @Query("SELECT ap FROM AuthProvider ap WHERE ap.userId = :userId")
    java.util.List<AuthProvider> findByUserId(@Param("userId") Long userId);
    
    /**
     * Check if a provider exists for a given provider ID
     */
    boolean existsByProviderAndProviderId(String provider, String providerId);
    
    /**
     * Update last login timestamp
     */
    @Modifying
    @Query("UPDATE AuthProvider ap SET ap.lastLoginAt = :lastLoginAt WHERE ap.id = :id")
    void updateLastLoginAt(@Param("id") Long id, @Param("lastLoginAt") LocalDateTime lastLoginAt);
    
    /**
     * Link auth provider to user
     */
    @Modifying
    @Query("UPDATE AuthProvider ap SET ap.userId = :userId WHERE ap.id = :id")
    void linkToUser(@Param("id") Long id, @Param("userId") Long userId);
    
    /**
     * Unlink auth provider from user
     */
    @Modifying
    @Query("UPDATE AuthProvider ap SET ap.userId = NULL WHERE ap.id = :id")
    void unlinkFromUser(@Param("id") Long id);
}
