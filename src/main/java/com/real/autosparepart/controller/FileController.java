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

    @Value("${app.images.brand-admin-panel-path:uploads/brands/}")
    private String brandUploadPath;

    @Value("${app.images.product-path:uploads/products/}")
    private String productUploadPath;

    @Value("${app.base-url:http://localhost:8080}")
    private String baseUrl;

    // Download image - auto detect from brand-admin-panel or product directory
    @GetMapping("/download/{fileName}")
    public ResponseEntity<?> downloadFile(@PathVariable String fileName) {
        try {
            System.out.println("=== Download Request ===");
            System.out.println("File name: " + fileName);

            byte[] fileBytes = null;
            String sourceDirectory = null;

            // Try to find in brand-admin-panel directory first
            try {
                fileBytes = fileService.getFileAsByteArray(brandUploadPath, fileName);
                sourceDirectory = "brands";
                System.out.println("Found in brand-admin-panel directory");
            } catch (Exception e1) {
                System.out.println("Not found in brand-admin-panel directory: " + e1.getMessage());

                // Try product directory
                try {
                    fileBytes = fileService.getFileAsByteArray(productUploadPath, fileName);
                    sourceDirectory = "products";
                    System.out.println("Found in product directory");
                } catch (Exception e2) {
                    System.out.println("Not found in product directory: " + e2.getMessage());
                    throw new RuntimeException("File not found in any directory: " + fileName);
                }
            }

            String contentType = determineContentType(fileName);

            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .header("X-File-Source", sourceDirectory)
                    .body(fileBytes);

        } catch (Exception e) {
            e.printStackTrace();
            Map<String, String> error = new HashMap<>();
            error.put("error", "File not found: " + fileName);
            error.put("message", e.getMessage());
            error.put("brandPath", brandUploadPath);
            error.put("productPath", productUploadPath);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        }
    }

    // Download brand-admin-panel image specifically
    @GetMapping("/download/brand-admin-panel/{fileName}")
    public ResponseEntity<?> downloadBrandFile(@PathVariable String fileName) {
        try {
            byte[] fileBytes = fileService.getFileAsByteArray(brandUploadPath, fileName);
            String contentType = determineContentType(fileName);

            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .body(fileBytes);

        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Brand file not found: " + fileName);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        }
    }

    // Download product image specifically
    @GetMapping("/download/product/{fileName}")
    public ResponseEntity<?> downloadProductFile(@PathVariable String fileName) {
        try {
            byte[] fileBytes = fileService.getFileAsByteArray(productUploadPath, fileName);
            String contentType = determineContentType(fileName);

            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .body(fileBytes);

        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Product file not found: " + fileName);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        }
    }

    // View image in browser (inline)
    @GetMapping("/view/{fileName}")
    public ResponseEntity<?> viewImage(@PathVariable String fileName) {
        try {
            byte[] fileBytes = null;

            // Try brand-admin-panel directory first
            try {
                fileBytes = fileService.getFileAsByteArray(brandUploadPath, fileName);
            } catch (Exception e1) {
                // Try product directory
                fileBytes = fileService.getFileAsByteArray(productUploadPath, fileName);
            }

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

    // Upload file (generic - specify type)
    @PostMapping("/upload")
    public ResponseEntity<?> uploadFile(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "type", defaultValue = "product") String type) {

        try {
            String uploadPath = type.equals("brand-admin-panel") ? brandUploadPath : productUploadPath;
            String fileName = fileService.uploadFile(uploadPath, file);

            Map<String, String> response = new HashMap<>();
            response.put("fileName", fileName);
            response.put("url", baseUrl + "/api/files/download/" + fileName);
            response.put("type", type);
            response.put("message", "File uploaded successfully");

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    // Upload brand-admin-panel image
    @PostMapping("/upload/brand-admin-panel")
    public ResponseEntity<?> uploadBrandImage(@RequestParam("file") MultipartFile file) {
        try {
            String fileName = fileService.uploadFile(brandUploadPath, file);

            Map<String, String> response = new HashMap<>();
            response.put("fileName", fileName);
            response.put("url", baseUrl + "/api/files/download/brand-admin-panel/" + fileName);
            response.put("type", "brand-admin-panel");
            response.put("message", "Brand image uploaded successfully");

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    // Upload product image
    @PostMapping("/upload/product")
    public ResponseEntity<?> uploadProductImage(@RequestParam("file") MultipartFile file) {
        try {
            String fileName = fileService.uploadFile(productUploadPath, file);

            Map<String, String> response = new HashMap<>();
            response.put("fileName", fileName);
            response.put("url", baseUrl + "/api/files/download/product/" + fileName);
            response.put("type", "product");
            response.put("message", "Product image uploaded successfully");

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    // Delete file from specific type
    @DeleteMapping("/delete/{type}/{fileName}")
    public ResponseEntity<?> deleteFile(@PathVariable String type, @PathVariable String fileName) {
        try {
            String uploadPath = type.equals("brand-admin-panel") ? brandUploadPath : productUploadPath;
            fileService.deleteFile(uploadPath, fileName);

            Map<String, String> response = new HashMap<>();
            response.put("message", "File deleted successfully: " + fileName);
            response.put("type", type);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        }
    }

    // Check if file exists and where
    @GetMapping("/check/{fileName}")
    public ResponseEntity<?> checkFile(@PathVariable String fileName) {
        Map<String, Object> result = new HashMap<>();
        result.put("fileName", fileName);

        // Check brand-admin-panel directory
        try {
            fileService.getFileAsByteArray(brandUploadPath, fileName);
            result.put("inBrandDirectory", true);
            result.put("brandUrl", baseUrl + "/api/files/download/brand-admin-panel/" + fileName);
        } catch (Exception e) {
            result.put("inBrandDirectory", false);
            result.put("brandError", e.getMessage());
        }

        // Check product directory
        try {
            fileService.getFileAsByteArray(productUploadPath, fileName);
            result.put("inProductDirectory", true);
            result.put("productUrl", baseUrl + "/api/files/download/product/" + fileName);
        } catch (Exception e) {
            result.put("inProductDirectory", false);
            result.put("productError", e.getMessage());
        }

        return ResponseEntity.ok(result);
    }

    // List all files in directories
    @GetMapping("/list")
    public ResponseEntity<?> listAllFiles() {
        Map<String, Object> result = new HashMap<>();

        try {
            result.put("brandFiles", fileService.getAllFiles(brandUploadPath));
        } catch (Exception e) {
            result.put("brandError", e.getMessage());
        }

        try {
            result.put("productFiles", fileService.getAllFiles(productUploadPath));
        } catch (Exception e) {
            result.put("productError", e.getMessage());
        }

        result.put("brandPath", brandUploadPath);
        result.put("productPath", productUploadPath);

        return ResponseEntity.ok(result);
    }

    private String determineContentType(String fileName) {
        if (fileName == null) {
            return "application/octet-stream";
        }

        String lowerName = fileName.toLowerCase();
        if (lowerName.endsWith(".jpg") || lowerName.endsWith(".jpeg")) {
            return "image/jpeg";
        } else if (lowerName.endsWith(".png")) {
            return "image/png";
        } else if (lowerName.endsWith(".gif")) {
            return "image/gif";
        } else if (lowerName.endsWith(".webp")) {
            return "image/webp";
        } else if (lowerName.endsWith(".bmp")) {
            return "image/bmp";
        } else if (lowerName.endsWith(".svg")) {
            return "image/svg+xml";
        }
        return "application/octet-stream";
    }
}