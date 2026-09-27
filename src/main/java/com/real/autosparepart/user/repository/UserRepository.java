package com.real.autosparepart.user.repository;

import com.real.autosparepart.user.entity.User;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Integer> {

    // ✅ Find user by email (including deleted)
    Optional<User> findByEmail(String email);

    // ✅ Find active user by email (not deleted)
    @Query("SELECT u FROM User u WHERE u.email = :email AND (u.deleted = false OR u.deleted IS NULL)")
    Optional<User> findByEmailAndNotDeleted(@Param("email") String email);

    // ✅ Find by username
    Optional<User> findByUsername(String username);

    // ✅ Find active user by username
    @Query("SELECT u FROM User u WHERE u.username = :username AND (u.deleted = false OR u.deleted IS NULL)")
    Optional<User> findByUsernameAndNotDeleted(@Param("username") String username);

    // ✅ Get all active users
    @Query("SELECT u FROM User u WHERE u.deleted = false OR u.deleted IS NULL")
    List<User> findAllActive();

    // ✅ Get deleted users only
    @Query("SELECT u FROM User u WHERE u.deleted = true")
    List<User> findAllDeleted();

    // ✅ Find by ID and not deleted
    @Query("SELECT u FROM User u WHERE u.userId = :id AND (u.deleted = false OR u.deleted IS NULL)")
    Optional<User> findByIdAndNotDeleted(@Param("id") Integer id);

    // ✅ Check if email exists
    boolean existsByEmail(String email);

    // ✅ Check if username exists
    boolean existsByUsername(String username);

    // ✅ Soft delete
    @Modifying
    @Transactional
    @Query("UPDATE User u SET u.deleted = true, u.deletedAt = CURRENT_TIMESTAMP, u.deletedBy = :deletedBy WHERE u.userId = :id")
    int softDelete(@Param("id") Integer id, @Param("deletedBy") Integer deletedBy);

    // ✅ Restore user
    @Modifying
    @Transactional
    @Query("UPDATE User u SET u.deleted = false, u.deletedAt = null, u.deletedBy = null WHERE u.userId = :id")
    int restore(@Param("id") Integer id);

    // ✅ Hard delete - Permanently remove from database
    @Modifying
    @Transactional
    @Query("DELETE FROM User u WHERE u.userId = :id")
    int hardDelete(@Param("id") Integer id);

    // ✅ Update password
    @Modifying
    @Transactional
    @Query("UPDATE User u SET u.password = :password WHERE u.email = :email")
    int updatePassword(@Param("email") String email, @Param("password") String password);
}