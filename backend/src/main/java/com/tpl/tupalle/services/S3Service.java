package com.tpl.tupalle.services;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectResponse;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.GetObjectPresignRequest;
import software.amazon.awssdk.services.s3.presigner.model.PresignedGetObjectRequest;

import java.io.IOException;
import java.time.Duration;
import java.util.UUID;

@Service
public class S3Service {

    @Value("${aws.s3.bucket-name}")
    private String bucketName;

    @Value("${aws.s3.region}")
    private String region;

    @Value("${aws.s3.endpoint-url:}")
    private String endpointUrl;

    private final S3Client s3Client;
    private final S3Presigner s3Presigner;

    public S3Service(S3Client s3Client, S3Presigner s3Presigner) {
        this.s3Client = s3Client;
        this.s3Presigner = s3Presigner;
    }

    public String uploadImage(MultipartFile file) throws IOException {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("File is empty");
        }

        // Validate file type
        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new IllegalArgumentException("File must be an image");
        }

        // Generate unique filename
        String originalFilename = file.getOriginalFilename();
        String extension = "";
        if (originalFilename != null && originalFilename.contains(".")) {
            extension = originalFilename.substring(originalFilename.lastIndexOf("."));
        }
        
        String filename = "images/" + UUID.randomUUID().toString() + extension;
        
        // Upload to S3
        PutObjectRequest putObjectRequest = PutObjectRequest.builder()
                .bucket(bucketName)
                .key(filename)
                .contentType(contentType)
                .build();

        PutObjectResponse response = s3Client.putObject(putObjectRequest, 
                RequestBody.fromInputStream(file.getInputStream(), file.getSize()));

        // Generate presigned URL for private bucket access
        return generatePresignedUrl(filename);
    }

    public void deleteImage(String imageUrl) {
        try {
            // Extract the key from the URL
            String key = extractKeyFromUrl(imageUrl);
            if (key != null) {
                s3Client.deleteObject(builder -> builder
                        .bucket(bucketName)
                        .key(key)
                        .build());
            }
        } catch (Exception e) {
            // Log error but don't throw exception to avoid breaking the main flow
            System.err.println("Failed to delete image from S3: " + e.getMessage());
        }
    }

    private String extractKeyFromUrl(String imageUrl) {
        if (imageUrl == null || imageUrl.isEmpty()) {
            return null;
        }

        // Handle both standard AWS S3 URLs and custom endpoint URLs
        if (imageUrl.contains(bucketName + ".s3.")) {
            // Standard AWS S3 URL: https://bucket.s3.region.amazonaws.com/key
            String[] parts = imageUrl.split(bucketName + ".s3\\.[^/]+/");
            return parts.length > 1 ? parts[1] : null;
        } else if (imageUrl.contains(bucketName + "/")) {
            // Custom endpoint URL: https://endpoint/bucket/key
            String[] parts = imageUrl.split(bucketName + "/");
            return parts.length > 1 ? parts[1] : null;
        }

        return null;
    }

    /**
     * Generate a presigned URL for accessing a private S3 object
     * @param key The S3 object key
     * @return Presigned URL valid for 7 days
     */
    public String generatePresignedUrl(String key) {
        GetObjectRequest getObjectRequest = GetObjectRequest.builder()
                .bucket(bucketName)
                .key(key)
                .build();

        GetObjectPresignRequest presignRequest = GetObjectPresignRequest.builder()
                .signatureDuration(Duration.ofDays(7)) // URL valid for 7 days
                .getObjectRequest(getObjectRequest)
                .build();

        PresignedGetObjectRequest presignedRequest = s3Presigner.presignGetObject(presignRequest);
        return presignedRequest.url().toString();
    }

    /**
     * Generate a presigned URL for an existing S3 object (useful for refreshing URLs)
     * @param imageUrl The existing image URL (will extract key from it)
     * @return New presigned URL
     */
    public String refreshPresignedUrl(String imageUrl) {
        String key = extractKeyFromUrl(imageUrl);
        if (key == null) {
            throw new IllegalArgumentException("Invalid image URL: " + imageUrl);
        }
        return generatePresignedUrl(key);
    }
}
