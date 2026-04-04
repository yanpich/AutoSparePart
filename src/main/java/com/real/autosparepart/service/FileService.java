package com.real.autosparepart.service;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.io.*;
import java.nio.file.*;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service  // ← THIS IS CRITICAL - registers bean in Spring context
public class FileService implements IFileService {

    @Override
    public String uploadFile(String uploadDir, MultipartFile file) throws IOException {
        // Create directory if not exists
        Path uploadPath = Paths.get(uploadDir);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        // Generate unique filename
        String originalFileName = file.getOriginalFilename();
        String extension = "";
        if (originalFileName != null && originalFileName.contains(".")) {
            extension = originalFileName.substring(originalFileName.lastIndexOf("."));
        }
        String fileName = UUID.randomUUID().toString() + extension;

        // Save file
        Path filePath = uploadPath.resolve(fileName);
        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

        return fileName;
    }

    @Override
    public InputStream getResource(String uploadDir, String name) throws FileNotFoundException {
        Path filePath = Paths.get(uploadDir).resolve(name);
        if (!Files.exists(filePath)) {
            throw new FileNotFoundException("File not found: " + name);
        }
        try {
            return Files.newInputStream(filePath);
        } catch (IOException e) {
            throw new FileNotFoundException("Unable to read file: " + name);
        }
    }

    @Override
    public List<String> getAllFiles(String uploadDir) throws IOException {
        Path uploadPath = Paths.get(uploadDir);
        if (!Files.exists(uploadPath)) {
            return new ArrayList<>();
        }

        return Files.list(uploadPath)
                .filter(Files::isRegularFile)
                .map(Path::getFileName)
                .map(Path::toString)
                .collect(Collectors.toList());
    }

    @Override
    public void deleteFile(String uploadDir, String image) {
        try {
            if (uploadDir == null || uploadDir.trim().isEmpty()) {
                throw new IllegalArgumentException("Upload directory cannot be null or empty");
            }

            if (image == null || image.trim().isEmpty()) {
                throw new IllegalArgumentException("Image filename cannot be null or empty");
            }

            // Security: Prevent path traversal
            String normalizedImage = Paths.get(image).normalize().toString();
            if (normalizedImage.contains("..")) {
                throw new SecurityException("Path traversal not allowed");
            }

            // Create full file path
            Path uploadPath = Paths.get(uploadDir).normalize();
            Path filePath = uploadPath.resolve(normalizedImage).normalize();

            // Security: Ensure within upload directory
            if (!filePath.startsWith(uploadPath)) {
                throw new SecurityException("Cannot delete files outside upload directory");
            }

            // Delete the file
            boolean deleted = Files.deleteIfExists(filePath);

            if (!deleted) {
                throw new FileNotFoundException("File not found: " + image);
            }

            System.out.println("File deleted successfully: " + filePath);

        } catch (FileNotFoundException e) {
            throw new RuntimeException("File not found: " + e.getMessage(), e);
        } catch (SecurityException e) {
            throw new RuntimeException("Security violation: " + e.getMessage(), e);
        } catch (IOException e) {
            throw new RuntimeException("Error deleting file: " + e.getMessage(), e);
        }
    }

    @Override
    public boolean deleteFileWithResult(String uploadDir, String image) {
        try {
            deleteFile(uploadDir, image);
            return true;
        } catch (Exception e) {
            System.err.println("Failed to delete file: " + e.getMessage());
            return false;
        }
    }

    @Override
    public void deleteMultipleFiles(String uploadDir, List<String> images) {
        if (images == null || images.isEmpty()) {
            throw new IllegalArgumentException("Images list cannot be null or empty");
        }

        List<String> failedDeletions = new ArrayList<>();

        for (String image : images) {
            try {
                deleteFile(uploadDir, image);
            } catch (Exception e) {
                failedDeletions.add(image);
                System.err.println("Failed to delete: " + image + " - " + e.getMessage());
            }
        }

        if (!failedDeletions.isEmpty()) {
            throw new RuntimeException("Failed to delete files: " + failedDeletions);
        }
    }

    @Override
    public void deleteAllFiles(String uploadDir) throws IOException {
        Path uploadPath = Paths.get(uploadDir);

        if (!Files.exists(uploadPath)) {
            throw new FileNotFoundException("Directory not found: " + uploadDir);
        }

        // Delete all files in directory
        Files.list(uploadPath)
                .filter(Files::isRegularFile)
                .forEach(file -> {
                    try {
                        Files.delete(file);
                    } catch (IOException e) {
                        throw new RuntimeException("Failed to delete file: " + file, e);
                    }
                });
        System.out.println("All files deleted from: " + uploadDir);
    }

    @Override
    public byte[] getFileAsByteArray(String uploadDir, String fileName) {
        try {
            Path uploadPath = Paths.get(uploadDir).normalize();
            Path filePath = uploadPath.resolve(fileName).normalize();

            // Security check
            if (!filePath.startsWith(uploadPath)) {
                throw new SecurityException("Cannot access files outside upload directory");
            }

            if (!Files.exists(filePath)) {
                throw new FileNotFoundException("File not found: " + fileName);
            }

            return Files.readAllBytes(filePath);

        } catch (IOException e) {
            throw new RuntimeException("Failed to read file: " + e.getMessage(), e);
        }
    }
}
