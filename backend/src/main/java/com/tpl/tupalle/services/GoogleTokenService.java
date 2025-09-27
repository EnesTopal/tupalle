package com.tpl.tupalle.services;

import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.exceptions.JWTVerificationException;
import com.auth0.jwt.interfaces.DecodedJWT;
import com.auth0.jwt.interfaces.JWTVerifier;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.math.BigInteger;
import java.security.KeyFactory;
import java.security.interfaces.RSAPublicKey;
import java.security.spec.RSAPublicKeySpec;
import java.util.Base64;
import java.util.Map;

@Service
public class GoogleTokenService {
    
    private static final Logger logger = LoggerFactory.getLogger(GoogleTokenService.class);
    private static final String GOOGLE_TOKEN_ENDPOINT = "https://oauth2.googleapis.com/token";
    private static final String GOOGLE_CERTS_ENDPOINT = "https://www.googleapis.com/oauth2/v3/certs";
    private static final String GOOGLE_ISSUER = "https://accounts.google.com";
    
    @Value("${spring.security.oauth2.client.registration.google.client-id}")
    private String clientId;
    
    @Value("${spring.security.oauth2.client.registration.google.client-secret}")
    private String clientSecret;
    
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;
    
    public GoogleTokenService() {
        this.restTemplate = new RestTemplate();
        this.objectMapper = new ObjectMapper();
    }
    
    /**
     * Exchange authorization code for ID token
     */
    public String exchangeCodeForIdToken(String code, String redirectUri) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
            
            String requestBody = String.format(
                "code=%s&client_id=%s&client_secret=%s&redirect_uri=%s&grant_type=authorization_code",
                code, clientId, clientSecret, redirectUri
            );
            
            HttpEntity<String> request = new HttpEntity<>(requestBody, headers);
            ResponseEntity<String> response = restTemplate.postForEntity(GOOGLE_TOKEN_ENDPOINT, request, String.class);
            
            if (response.getStatusCode() == HttpStatus.OK) {
                JsonNode jsonResponse = objectMapper.readTree(response.getBody());
                return jsonResponse.get("id_token").asText();
            } else {
                logger.error("Failed to exchange code for token: {}", response.getStatusCode());
                throw new RuntimeException("Failed to exchange authorization code for ID token");
            }
        } catch (Exception e) {
            logger.error("Error exchanging code for ID token", e);
            throw new RuntimeException("Error exchanging authorization code for ID token", e);
        }
    }
    
    /**
     * Validate and decode Google ID token
     */
    public DecodedJWT validateAndDecodeIdToken(String idToken) {
        try {
            // Decode without verification first to get header
            DecodedJWT unverifiedJWT = JWT.decode(idToken);
            
            // Get Google's public keys
            Map<String, RSAPublicKey> publicKeys = getGooglePublicKeys();
            
            // Get the key ID from token header
            String keyId = unverifiedJWT.getKeyId();
            RSAPublicKey publicKey = publicKeys.get(keyId);
            
            if (publicKey == null) {
                throw new JWTVerificationException("Public key not found for key ID: " + keyId);
            }
            
            // Verify the token
            Algorithm algorithm = Algorithm.RSA256(publicKey, null);
            JWTVerifier verifier = JWT.require(algorithm)
                    .withIssuer(GOOGLE_ISSUER)
                    .withAudience(clientId)
                    .build();
            
            return verifier.verify(idToken);
        } catch (JWTVerificationException e) {
            logger.error("JWT verification failed", e);
            throw new RuntimeException("Invalid ID token", e);
        } catch (Exception e) {
            logger.error("Error validating ID token", e);
            throw new RuntimeException("Error validating ID token", e);
        }
    }
    
    /**
     * Get Google's public keys for JWT verification
     */
    private Map<String, RSAPublicKey> getGooglePublicKeys() {
        try {
            ResponseEntity<String> response = restTemplate.getForEntity(GOOGLE_CERTS_ENDPOINT, String.class);
            JsonNode jsonResponse = objectMapper.readTree(response.getBody());
            
            Map<String, RSAPublicKey> publicKeys = new java.util.HashMap<>();
            
            JsonNode keys = jsonResponse.get("keys");
            for (JsonNode key : keys) {
                String keyId = key.get("kid").asText();
                String n = key.get("n").asText();
                String e = key.get("e").asText();
                
                // Decode base64url encoded values
                byte[] nBytes = Base64.getUrlDecoder().decode(n);
                byte[] eBytes = Base64.getUrlDecoder().decode(e);
                
                // Create RSA public key
                BigInteger modulus = new BigInteger(1, nBytes);
                BigInteger exponent = new BigInteger(1, eBytes);
                
                RSAPublicKeySpec spec = new RSAPublicKeySpec(modulus, exponent);
                KeyFactory keyFactory = KeyFactory.getInstance("RSA");
                RSAPublicKey publicKey = (RSAPublicKey) keyFactory.generatePublic(spec);
                
                publicKeys.put(keyId, publicKey);
            }
            
            return publicKeys;
        } catch (Exception e) {
            logger.error("Error fetching Google public keys", e);
            throw new RuntimeException("Error fetching Google public keys", e);
        }
    }
    
    /**
     * Extract profile information from decoded JWT
     */
    public GoogleProfile extractProfile(DecodedJWT jwt) {
        return new GoogleProfile(
            jwt.getSubject(), // sub
            jwt.getClaim("email").asString(),
            jwt.getClaim("email_verified").asBoolean(),
            jwt.getClaim("name").asString(),
            jwt.getClaim("given_name").asString(),
            jwt.getClaim("family_name").asString(),
            jwt.getClaim("picture").asString(),
            jwt.getClaim("locale").asString()
        );
    }
    
    /**
     * Profile data extracted from Google ID token
     */
    public static class GoogleProfile {
        public final String sub;
        public final String email;
        public final Boolean emailVerified;
        public final String name;
        public final String givenName;
        public final String familyName;
        public final String picture;
        public final String locale;
        
        public GoogleProfile(String sub, String email, Boolean emailVerified, String name, 
                           String givenName, String familyName, String picture, String locale) {
            this.sub = sub;
            this.email = email;
            this.emailVerified = emailVerified != null ? emailVerified : false;
            this.name = name;
            this.givenName = givenName;
            this.familyName = familyName;
            this.picture = picture;
            this.locale = locale;
        }
    }
}
