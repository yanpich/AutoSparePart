package com.real.autosparepart.user.controller;

import com.real.autosparepart.user.entity.User;
import com.real.autosparepart.common.enums.UserRole;
import com.real.autosparepart.user.repository.UserRepository;
import com.real.autosparepart.user.dto.UserDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin/users")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
@Slf4j
public class UserController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    // ==================== GET METHODS ====================

    // Get all active users (not deleted)
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getAllUsers() {
        try {
            List<UserDTO> users = userRepository.findAllActive().stream()
                    .map(this::convertToDTO)
                    .collect(Collectors.toList());

            Map<String, Object> response = new HashMap<>();
            response.put("content", users);
            response.put("total", users.size());
            response.put("type", "active");

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Failed to fetch users: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to fetch users: " + e.getMessage()));
        }
    }

    // Get deleted users only
    @GetMapping("/deleted")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getDeletedUsers() {
        try {
            List<UserDTO> deletedUsers = userRepository.findAllDeleted().stream()
                    .map(this::convertToDTO)
                    .collect(Collectors.toList());

            Map<String, Object> response = new HashMap<>();
            response.put("content", deletedUsers);
            response.put("total", deletedUsers.size());
            response.put("type", "deleted");

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Failed to fetch deleted users: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to fetch deleted users: " + e.getMessage()));
        }
    }

    // Get all users (including deleted)
    @GetMapping("/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getAllUsersIncludingDeleted() {
        try {
            List<UserDTO> allUsers = userRepository.findAll().stream()
                    .map(this::convertToDTO)
                    .collect(Collectors.toList());

            return ResponseEntity.ok(Map.of(
                    "content", allUsers,
                    "total", allUsers.size(),
                    "type", "all"
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to fetch users: " + e.getMessage()));
        }
    }

    // Get user by ID (only if not deleted)
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getUserById(@PathVariable Integer id) {
        try {
            User user = userRepository.findByIdAndNotDeleted(id)
                    .orElseThrow(() -> new RuntimeException("User not found with id: " + id));
            return ResponseEntity.ok(convertToDTO(user));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    // ==================== CREATE/UPDATE METHODS ====================

    // Create new user
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> createUser(@RequestBody UserDTO userDTO) {
        try {
            log.info("Creating new user with email: {}", userDTO.getEmail());

            // Validate required fields
            if (userDTO.getEmail() == null || userDTO.getEmail().trim().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Email is required"));
            }
            if (userDTO.getFullName() == null || userDTO.getFullName().trim().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Full name is required"));
            }

            // Check if email already exists
            if (userRepository.existsByEmail(userDTO.getEmail())) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Email already exists: " + userDTO.getEmail()));
            }

            // Check if username already exists
            if (userDTO.getUsername() != null && userRepository.existsByUsername(userDTO.getUsername())) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Username already exists: " + userDTO.getUsername()));
            }

            // Generate username from email if not provided
            String username = userDTO.getUsername();
            if (username == null || username.trim().isEmpty()) {
                username = userDTO.getEmail().split("@")[0];
                String baseUsername = username;
                int counter = 1;
                while (userRepository.existsByUsername(username)) {
                    username = baseUsername + counter;
                    counter++;
                }
            }

            // Set default password if not provided
            String password = userDTO.getPassword();
            if (password == null || password.trim().isEmpty()) {
                password = "default123";
            }

            // Create new user
            User user = User.builder()
                    .name(userDTO.getFullName())
                    .username(username)
                    .email(userDTO.getEmail())
                    .password(passwordEncoder.encode(password))
                    .role(UserRole.valueOf(userDTO.getRole()))
                    .phone(userDTO.getPhone())
                    .address(userDTO.getAddress())
                    .deleted(false)
                    .build();

            User savedUser = userRepository.save(user);
            log.info("User created successfully with ID: {}", savedUser.getUserId());

            return ResponseEntity.status(HttpStatus.CREATED).body(convertToDTO(savedUser));
        } catch (IllegalArgumentException e) {
            log.error("Invalid role: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Invalid role. Must be ADMIN or USER"));
        } catch (Exception e) {
            log.error("Failed to create user: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to create user: " + e.getMessage()));
        }
    }

    // ✅ Update user
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateUser(@PathVariable Integer id, @RequestBody UserDTO userDTO) {
        try {
            log.info("Updating user with ID: {}", id);

            User user = userRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("User not found with id: " + id));

            if (userDTO.getFullName() != null && !userDTO.getFullName().trim().isEmpty()) {
                user.setName(userDTO.getFullName());
            }
            if (userDTO.getEmail() != null && !user.getEmail().equals(userDTO.getEmail())) {
                if (userRepository.existsByEmail(userDTO.getEmail())) {
                    return ResponseEntity.badRequest()
                            .body(Map.of("error", "Email already exists: " + userDTO.getEmail()));
                }
                user.setEmail(userDTO.getEmail());
            }
            if (userDTO.getPhone() != null) {
                user.setPhone(userDTO.getPhone());
            }
            if (userDTO.getRole() != null) {
                user.setRole(UserRole.valueOf(userDTO.getRole()));
            }
            if (userDTO.getAddress() != null) {
                user.setAddress(userDTO.getAddress());
            }

            User updatedUser = userRepository.save(user);
            log.info("User updated successfully: {}", updatedUser.getUserId());

            return ResponseEntity.ok(convertToDTO(updatedUser));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Invalid role. Must be ADMIN or USER"));
        } catch (Exception e) {
            log.error("Failed to update user: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to update user: " + e.getMessage()));
        }
    }

    // ==================== DELETE/RESTORE METHODS ====================

    // ✅ Soft Delete - Change status to deleted
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> softDeleteUser(@PathVariable Integer id) {
        try {
            log.info("Soft deleting user with ID: {}", id);

            User user = userRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("User not found with id: " + id));

            // Prevent deleting the last admin
            long activeAdminCount = userRepository.findAllActive().stream()
                    .filter(u -> u.getRole() == UserRole.ADMIN)
                    .count();

            if (user.getRole() == UserRole.ADMIN && activeAdminCount <= 1) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Cannot delete the last admin user"));
            }

            // Get current user ID
            Integer currentUserId = getCurrentUserId();

            // Perform soft delete
            int deleted = userRepository.softDelete(id, currentUserId);

            if (deleted > 0) {
                return ResponseEntity.ok(Map.of(
                        "message", "User deleted successfully (soft delete)",
                        "userId", id,
                        "status", "deleted"
                ));
            } else {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Failed to delete user"));
            }
        } catch (Exception e) {
            log.error("Failed to delete user: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to delete user: " + e.getMessage()));
        }
    }

    // ✅ Restore user (re-activate)
    @PatchMapping("/{id}/restore")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> restoreUser(@PathVariable Integer id) {
        try {
            log.info("Restoring user with ID: {}", id);

            int restored = userRepository.restore(id);

            if (restored > 0) {
                return ResponseEntity.ok(Map.of(
                        "message", "User restored successfully",
                        "userId", id,
                        "status", "active"
                ));
            } else {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "User not found or already active"));
            }
        } catch (Exception e) {
            log.error("Failed to restore user: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to restore user: " + e.getMessage()));
        }
    }

    // ✅ Hard Delete - Permanently remove from database (use with caution)
    @DeleteMapping("/{id}/permanent")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> hardDeleteUser(@PathVariable Integer id) {
        try {
            log.warn("Hard deleting user with ID: {}", id);

            User user = userRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("User not found with id: " + id));

            // Prevent deleting the last admin
            long adminCount = userRepository.findAll().stream()
                    .filter(u -> u.getRole() == UserRole.ADMIN)
                    .count();

            if (user.getRole() == UserRole.ADMIN && adminCount <= 1) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Cannot permanently delete the last admin user"));
            }

            int deleted = userRepository.hardDelete(id);

            if (deleted > 0) {
                return ResponseEntity.ok(Map.of(
                        "message", "User permanently deleted from database",
                        "userId", id
                ));
            } else {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "User not found"));
            }
        } catch (Exception e) {
            log.error("Failed to hard delete user: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to delete user: " + e.getMessage()));
        }
    }

    // ==================== PASSWORD METHODS ====================

    // ✅ Change user status
    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> changeStatus(@PathVariable Integer id, @RequestBody Map<String, String> request) {
        try {
            String status = request.get("status");
            log.info("Changing status for user {} to: {}", id, status);

            User user = userRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("User not found with id: " + id));

            if ("active".equals(status)) {
                user.setDeleted(false);
            } else if ("inactive".equals(status)) {
                user.setDeleted(true);
            }

            userRepository.save(user);

            return ResponseEntity.ok(Map.of("message", "Status changed to " + status));
        } catch (Exception e) {
            log.error("Failed to change status: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to change status: " + e.getMessage()));
        }
    }

    // ✅ Change user role
    @PatchMapping("/{id}/role")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> changeRole(@PathVariable Integer id, @RequestBody Map<String, String> request) {
        try {
            String role = request.get("role");
            log.info("Changing role for user {} to: {}", id, role);

            User user = userRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("User not found with id: " + id));

            user.setRole(UserRole.valueOf(role));
            userRepository.save(user);

            return ResponseEntity.ok(Map.of("message", "Role changed to " + role));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Invalid role. Must be ADMIN or USER"));
        } catch (Exception e) {
            log.error("Failed to change role: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to change role: " + e.getMessage()));
        }
    }

    // ✅ Reset password
    @PostMapping("/{id}/reset-password")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> resetPassword(@PathVariable Integer id, @RequestBody Map<String, String> request) {
        try {
            String newPassword = request.get("password");
            log.info("Resetting password for user: {}", id);

            if (newPassword == null || newPassword.length() < 6) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Password must be at least 6 characters"));
            }

            User user = userRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("User not found with id: " + id));

            user.setPassword(passwordEncoder.encode(newPassword));
            userRepository.save(user);

            return ResponseEntity.ok(Map.of("message", "Password reset successfully"));
        } catch (Exception e) {
            log.error("Failed to reset password: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to reset password: " + e.getMessage()));
        }
    }

    // ==================== ACTIVITY METHODS ====================

    // ✅ Get user activity log
    @GetMapping("/{id}/activity")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getUserActivity(@PathVariable Integer id) {
        try {
            log.info("Fetching activity for user: {}", id);
            // Return mock activity data (implement real activity logging if needed)
            List<Map<String, Object>> activities = List.of(
                    Map.of("action", "User logged in", "timestamp", LocalDateTime.now().minusHours(2), "ipAddress", "192.168.1.1"),
                    Map.of("action", "Updated profile", "timestamp", LocalDateTime.now().minusDays(1), "ipAddress", "192.168.1.1"),
                    Map.of("action", "Changed password", "timestamp", LocalDateTime.now().minusDays(3), "ipAddress", "192.168.1.1")
            );
            return ResponseEntity.ok(activities);
        } catch (Exception e) {
            log.error("Failed to fetch activity: {}", e.getMessage());
            return ResponseEntity.ok(List.of());
        }
    }

    // ==================== HELPER METHODS ====================

    // Helper method to get current user ID
    private Integer getCurrentUserId() {
        var authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof User) {
            return ((User) authentication.getPrincipal()).getUserId();
        }
        return null;
    }

    // Convert User to UserDTO
    private UserDTO convertToDTO(User user) {
        return UserDTO.builder()
                .userId(user.getUserId())
                .fullName(user.getName())
                .username(user.getUsername())
                .email(user.getEmail())
                .phone(user.getPhone())
                .role(user.getRole().name())
                .status(user.isDeleted() ? "deleted" : "active")
                .address(user.getAddress())
                .createdAt(user.getCreatedAt() != null ? user.getCreatedAt().toString() : null)
                .build();
    }
}