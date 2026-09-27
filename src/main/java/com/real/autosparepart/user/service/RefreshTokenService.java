package com.real.autosparepart.user.service;

import com.real.autosparepart.user.entity.RefreshToken;
import com.real.autosparepart.user.entity.User;
import com.real.autosparepart.auth.repositories.RefreshTokenRepository;
import com.real.autosparepart.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class RefreshTokenService {

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;

    private static final long REFRESH_TOKEN_VALIDITY_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

    @Transactional
    public RefreshToken createRefreshToken(String email) {
        log.info("📝 Creating refresh token for email: {}", email);

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> {
                    log.error("❌ User not found with email: {}", email);
                    return new UsernameNotFoundException("User not found with email: " + email);
                });

        // Delete existing token if present
        refreshTokenRepository.findByUser(user).ifPresent(existing -> {
            log.info("🗑️ Removing existing refresh token for: {}", email);
            refreshTokenRepository.delete(existing);
            refreshTokenRepository.flush();
        });

        // Create new token
        RefreshToken refreshToken = RefreshToken.builder()
                .refreshToken(UUID.randomUUID().toString())
                .expirationTime(Instant.now().plusMillis(REFRESH_TOKEN_VALIDITY_MS))
                .user(user)
                .build();

        RefreshToken savedToken = refreshTokenRepository.save(refreshToken);
        log.info("✅ Refresh token created successfully for user: {}", email);

        return savedToken;
    }

    @Transactional
    public RefreshToken verifyRefreshToken(String refreshTokenValue) {
        log.info("🔍 Verifying refresh token");

        RefreshToken refreshToken = refreshTokenRepository.findByRefreshToken(refreshTokenValue)
                .orElseThrow(() -> {
                    log.error("❌ Refresh token not found");
                    return new RuntimeException("Refresh token not found!");
                });

        if (refreshToken.getExpirationTime().compareTo(Instant.now()) < 0) {
            log.warn("⚠️ Refresh token has expired for user: {}",
                    refreshToken.getUser().getEmail());
            refreshTokenRepository.delete(refreshToken);
            throw new RuntimeException("Refresh Token has expired. Please login again.");
        }

        log.info("✅ Refresh token verified successfully for user: {}",
                refreshToken.getUser().getEmail());

        return refreshToken;
    }

    @Transactional
    public void deleteByUserEmail(String email) {
        userRepository.findByEmail(email).ifPresent(user -> {
            refreshTokenRepository.findByUser(user).ifPresent(token -> {
                log.info("🗑️ Deleting refresh token for user: {}", email);
                refreshTokenRepository.delete(token);
            });
        });
    }
}