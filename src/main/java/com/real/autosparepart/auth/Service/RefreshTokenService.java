package com.real.autosparepart.auth.Service;

import com.real.autosparepart.auth.entity.RefreshToken;
import com.real.autosparepart.auth.entity.User;
import com.real.autosparepart.auth.repositories.RefreshTokenRepository;
import com.real.autosparepart.auth.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class RefreshTokenService {

    private final RefreshTokenRepository refreshTokenRepository;
    private final UserRepository userRepository;

    @Transactional
    public RefreshToken saveRefreshToken(String token, User user) {
        RefreshToken refreshToken = RefreshToken.builder()
                .refreshToken(token)
                .user(user)
                .expirationTime(Instant.now().plusSeconds(604800)) // 7 days
                .revoked(false)
                .build();

        return refreshTokenRepository.save(refreshToken);
    }

    public Optional<RefreshToken> findByToken(String token) {
        return refreshTokenRepository.findByRefreshToken(token);
    }

    @Transactional
    public void revokeToken(RefreshToken token) {
        token.setRevoked(true);
        refreshTokenRepository.save(token);
    }

    @Transactional
    public void revokeAllUserTokens(User user) {
        refreshTokenRepository.findAllByUser(user)
                .forEach(token -> {
                    token.setRevoked(true);
                    refreshTokenRepository.save(token);
                });
    }

    @Transactional
    public void deleteToken(RefreshToken token) {
        refreshTokenRepository.delete(token);
    }
}