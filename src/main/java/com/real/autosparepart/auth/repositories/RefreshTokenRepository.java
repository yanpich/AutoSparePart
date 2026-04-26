package com.real.autosparepart.auth.repositories;

import com.real.autosparepart.auth.entity.RefreshToken;
import com.real.autosparepart.auth.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {
    Optional<RefreshToken> findByRefreshToken(String token);
    List<RefreshToken> findAllByUser(User user);
    void deleteAllByUser(User user);
}