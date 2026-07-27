package com.real.autosparepart.auth.repositories;

import com.real.autosparepart.auth.entity.RefreshToken;
import com.real.autosparepart.auth.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Integer> {

    Optional<RefreshToken> findByRefreshToken(String refreshToken);

    Optional<RefreshToken> findByUser(User user);

    void deleteByUser(User user);
}