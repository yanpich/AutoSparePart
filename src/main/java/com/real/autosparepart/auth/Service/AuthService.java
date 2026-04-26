package com.real.autosparepart.auth.Service;

import com.real.autosparepart.auth.dto.request.LoginRequest;
import com.real.autosparepart.auth.dto.request.RefreshTokenRequest;
import com.real.autosparepart.auth.dto.request.RegisterRequest;
import com.real.autosparepart.auth.dto.response.AuthResponse;
import com.real.autosparepart.auth.entity.RefreshToken;
import com.real.autosparepart.auth.entity.User;
import com.real.autosparepart.auth.entity.UserRole;
import com.real.autosparepart.auth.repositories.UserRepository;
import com.real.autosparepart.auth.exception.AuthException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final RefreshTokenService refreshTokenService;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        // Check if email already exists
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new AuthException("Email already registered");
        }

        // Check if username already exists
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new AuthException("Username already taken");
        }

        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .username(request.getUsername())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(UserRole.USER)
                .isEnabled(true)
                .isAccountNonExpired(true)
                .isAccountNonLocked(true)
                .isCredentialsNonExpired(true)
                .build();

        user = userRepository.save(user);
        log.info("New user registered: {}", user.getEmail());

        String accessToken = jwtService.generateAccessToken(user.getEmail());
        String refreshToken = jwtService.generateRefreshToken(user.getEmail());

        // Save refresh token to database
        refreshTokenService.saveRefreshToken(refreshToken, user);

        return new AuthResponse(accessToken, refreshToken);
    }

    @Transactional
    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new AuthException("Invalid credentials"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new AuthException("Invalid credentials");
        }

        if (!user.isEnabled()) {
            throw new AuthException("Account is disabled");
        }

        log.info("User logged in: {}", user.getEmail());

        // Revoke all existing refresh tokens for this user (optional security)
        refreshTokenService.revokeAllUserTokens(user);

        String accessToken = jwtService.generateAccessToken(user.getEmail());
        String refreshToken = jwtService.generateRefreshToken(user.getEmail());

        refreshTokenService.saveRefreshToken(refreshToken, user);

        return new AuthResponse(accessToken, refreshToken);
    }

    @Transactional
    public AuthResponse refreshToken(RefreshTokenRequest request) {
        String refreshToken = request.getRefreshToken();

        // Validate refresh token
        RefreshToken storedToken = refreshTokenService.findByToken(refreshToken)
                .orElseThrow(() -> new AuthException("Invalid refresh token"));

        if (storedToken.isRevoked()) {
            throw new AuthException("Refresh token has been revoked");
        }

        if (storedToken.getExpirationTime().isBefore(java.time.Instant.now())) {
            refreshTokenService.deleteToken(storedToken);
            throw new AuthException("Refresh token expired");
        }

        String userEmail = jwtService.extractUsername(refreshToken);
        if (!jwtService.validateToken(refreshToken, userEmail)) {
            throw new AuthException("Invalid refresh token");
        }

        // Generate new tokens (refresh token rotation)
        String newAccessToken = jwtService.generateAccessToken(userEmail);
        String newRefreshToken = jwtService.generateRefreshToken(userEmail);

        // Revoke old refresh token and save new one
        refreshTokenService.revokeToken(storedToken);
        refreshTokenService.saveRefreshToken(newRefreshToken, storedToken.getUser());

        log.info("Tokens refreshed for user: {}", userEmail);

        return new AuthResponse(newAccessToken, newRefreshToken);
    }

    @Transactional
    public void logout(String refreshToken) {
        refreshTokenService.findByToken(refreshToken)
                .ifPresent(token -> {
                    refreshTokenService.revokeToken(token);
                    log.info("User logged out, token revoked");
                });
    }
}