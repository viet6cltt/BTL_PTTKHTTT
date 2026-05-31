package com.training.logistics.facility_contract.service;

import com.training.logistics.facility_contract.exception.MinioStorageException;
import io.minio.BucketExistsArgs;
import io.minio.GetObjectArgs;
import io.minio.MakeBucketArgs;
import io.minio.MinioClient;
import io.minio.PutObjectArgs;
import io.minio.RemoveObjectArgs;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;

@Service
@RequiredArgsConstructor
public class MinioStorageService {
    private final MinioClient minioClient;

    @Value("${minio.endpoint}")
    private String endpoint;

    @Value("${minio.bucket.contracts}")
    private String bucketName;

    public String uploadFile(String objectName, MultipartFile file) {
        try {
            ensureBucketExists();
            minioClient.putObject(PutObjectArgs.builder()
                    .bucket(bucketName)
                    .object(objectName)
                    .stream(file.getInputStream(), file.getSize(), -1)
                    .contentType(file.getContentType())
                    .build());
            return getFileUrl(objectName);
        } catch (Exception ex) {
            throw new MinioStorageException("Could not upload contract file", ex);
        }
    }

    public void deleteFile(String objectName) {
        try {
            ensureBucketExists();
            minioClient.removeObject(RemoveObjectArgs.builder()
                    .bucket(bucketName)
                    .object(objectName)
                    .build());
        } catch (Exception ex) {
            throw new MinioStorageException("Could not delete contract file", ex);
        }
    }

    public String getFileUrl(String objectName) {
        String normalizedEndpoint = endpoint.endsWith("/") ? endpoint.substring(0, endpoint.length() - 1) : endpoint;
        return normalizedEndpoint + "/" + bucketName + "/" + objectName;
    }

    public String extractObjectName(String fileUrl) {
        if (fileUrl == null || fileUrl.isBlank()) {
            return null;
        }

        String bucketPrefix = "/" + bucketName + "/";
        int bucketIndex = fileUrl.indexOf(bucketPrefix);
        if (bucketIndex < 0) {
            return null;
        }
        return fileUrl.substring(bucketIndex + bucketPrefix.length());
    }

    public InputStream downloadFile(String objectName) {
        try {
            ensureBucketExists();
            return minioClient.getObject(GetObjectArgs.builder()
                    .bucket(bucketName)
                    .object(objectName)
                    .build());
        } catch (Exception ex) {
            throw new MinioStorageException("Could not download contract file", ex);
        }
    }

    private void ensureBucketExists() throws Exception {
        boolean exists = minioClient.bucketExists(BucketExistsArgs.builder()
                .bucket(bucketName)
                .build());
        if (!exists) {
            minioClient.makeBucket(MakeBucketArgs.builder()
                    .bucket(bucketName)
                    .build());
        }
    }
}
