package com.tpl.tupalle.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.S3ClientBuilder;
import software.amazon.awssdk.services.s3.S3Configuration;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;

import java.net.URI;

@Configuration
public class S3Config {

    @Value("${aws.s3.region}")
    private String region;

    @Value("${aws.s3.access-key:}")
    private String accessKey;

    @Value("${aws.s3.secret-key:}")
    private String secretKey;

    @Value("${aws.s3.endpoint-url:}")
    private String endpointUrl;

    @Value("${aws.s3.path-style:false}") // MinIO/LocalStack için true yap
    private boolean pathStyle;

    @Bean
    public S3Client s3Client() {
        S3ClientBuilder builder = S3Client.builder()
                .region(Region.of(region));

        if (!isBlank(accessKey) && !isBlank(secretKey)) {
            builder.credentialsProvider(
                    StaticCredentialsProvider.create(AwsBasicCredentials.create(accessKey, secretKey))
            );
        }

        if (!isBlank(endpointUrl)) {
            builder.endpointOverride(URI.create(endpointUrl));
        }

        if (pathStyle) {
            builder.serviceConfiguration(
                    S3Configuration.builder().pathStyleAccessEnabled(true).build()
            );
        }

        return builder.build();
    }

    @Bean
    public S3Presigner s3Presigner() {
        S3Presigner.Builder builder = S3Presigner.builder()
                .region(Region.of(region));

        if (!isBlank(accessKey) && !isBlank(secretKey)) {
            builder.credentialsProvider(
                    StaticCredentialsProvider.create(AwsBasicCredentials.create(accessKey, secretKey))
            );
        }

        if (!isBlank(endpointUrl)) {
            builder.endpointOverride(URI.create(endpointUrl));
        }

        return builder.build();
    }

    private static boolean isBlank(String s) {
        return s == null || s.isEmpty();
    }
}
