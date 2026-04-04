package com.real.autosparepart.controller;

import com.real.autosparepart.service.IFileService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/files")
public class FileController {

    @Autowired
    private IFileService fileService;

    @Value("${app.images.brand-path:uploads/brands/}")
    private String brandUploadPath;

    // Download image by filename
    @GetMapping("/download/{fileName}")
    public ResponseEntity<?> downloadFile(@PathVariable String fileName) {
        try {
            byte[] fileBytes = fileService.getFileAsByteArray(brandUploadPath, fileName);
            String contentType = determineContentType(fileName);

            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .body(fileBytes);

        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "File not found: " + fileName);
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        }
    }

    // View image in browser (inline)
    @GetMapping("/view/{fileName}")
    public ResponseEntity<?> viewImage(@PathVariable String fileName) {
        try {
            byte[] fileBytes = fileService.getFileAsByteArray(brandUploadPath, fileName);
            String contentType = determineContentType(fileName);

            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .header("Content-Disposition", "inline; filename=\"" + fileName + "\"")
                    .body(fileBytes);

        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "File not found: " + fileName);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        }
    }

    // Upload file endpoint (for testing)
    @PostMapping("/upload")
    public ResponseEntity<?> uploadFile(@RequestParam("file") MultipartFile file) {
        try {
            String fileName = fileService.uploadFile(brandUploadPath, file);

            Map<String, String> response = new HashMap<>();
            response.put("fileName", fileName);
            response.put("url", "http://localhost:8080/api/files/download/" + fileName);
            response.put("message", "File uploaded successfully");

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    // Delete file
    @DeleteMapping("/delete/{fileName}")
    public ResponseEntity<?> deleteFile(@PathVariable String fileName) {
        try {
            fileService.deleteFile(brandUploadPath, fileName);

            Map<String, String> response = new HashMap<>();
            response.put("message", "File deleted successfully: " + fileName);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        }
    }

    private String determineContentType(String fileName) {
        if (fileName == null) {
            return "application/octet-stream";
        }

        if (fileName.endsWith(".jpg") || fileName.endsWith(".jpeg")) {
            return "image/jpeg";
        } else if (fileName.endsWith(".png")) {
            return "image/png";
        } else if (fileName.endsWith(".gif")) {
            return "image/gif";
        } else if (fileName.endsWith(".webp")) {
            return "image/webp";
        } else if (fileName.endsWith(".bmp")) {
            return "image/bmp";
        } else if (fileName.endsWith(".svg")) {
            return "image/svg+xml";
        }
        return "application/octet-stream";
    }
}