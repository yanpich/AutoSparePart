package com.real.autosparepart.auth.Service;

import com.real.autosparepart.auth.dto.request.LoginRequest;
import com.real.autosparepart.auth.dto.request.RegisterRequest;
import com.real.autosparepart.auth.dto.response.AuthResponse;
import com.real.autosparepart.auth.entity.RefreshToken;
import com.real.autosparepart.auth.entity.User;
import com.real.autosparepart.auth.entity.UserRole;
import com.real.autosparepart.auth.repositories.RefreshTokenRepository;
import com.real.autosparepart.auth.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final PasswordEncoder passwordEncoder;
    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final RefreshTokenService refreshTokenService;
    private final AuthenticationManager authenticationManager;
    private final RefreshTokenRepository refreshTokenRepository;

    /**
     * Register a new user
     */
    @Transactional
    public AuthResponse register(RegisterRequest registerRequest) {
        log.info("📝 Registering new user with email: {}", registerRequest.getEmail());

        // Check if email already exists
        if (userRepository.existsByEmail(registerRequest.getEmail())) {
            throw new RuntimeException("Email already exists: " + registerRequest.getEmail());
        }

        // Check if username already exists
        if (userRepository.existsByUsername(registerRequest.getUsername())) {
            throw new RuntimeException("Username already exists: " + registerRequest.getUsername());
        }

        // Create new user
        var user = User.builder()
                .name(registerRequest.getName())
                .email(registerRequest.getEmail())
                .username(registerRequest.getUsername())
                .password(passwordEncoder.encode(registerRequest.getPassword()))
                .role(UserRole.USER)
                .build();

        User savedUser = userRepository.save(user);
        log.info("✅ User registered successfully with ID: {}", savedUser.getUserId());

        // Generate tokens
        String accessToken = jwtService.generateToken(savedUser);
        RefreshToken refreshToken = refreshTokenService.createRefreshToken(savedUser.getEmail());

        log.info("🔑 Tokens generated for user: {}", savedUser.getEmail());

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken.getRefreshToken())
                .name(savedUser.getName())
                .email(savedUser.getEmail())
                .role(savedUser.getRole().name())
                .userId(savedUser.getUserId())
                .build();
    }

    /**
     * Authenticate user and generate tokens
     */
    @Transactional
    public AuthResponse login(LoginRequest loginRequest) {
        log.info("🔐 Login attempt for email: {}", loginRequest.getEmail());

        try {
            // 1. Authenticate user
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            loginRequest.getEmail(),
                            loginRequest.getPassword()
                    )
            );

            log.info("✅ Authentication successful for: {}", loginRequest.getEmail());

        } catch (BadCredentialsException e) {
            log.error("❌ Bad credentials for email: {}", loginRequest.getEmail());
            throw new BadCredentialsException("Invalid email or password");
        }

        // 2. Find user
        var user = userRepository.findByEmail(loginRequest.getEmail())
                .orElseThrow(() -> {
                    log.error("❌ User not found with email: {}", loginRequest.getEmail());
                    return new UsernameNotFoundException("User not found with email: " + loginRequest.getEmail());
                });

        // 3. Delete existing refresh token if present (to avoid duplicate constraint)
        refreshTokenRepository.findByUser(user).ifPresent(existingToken -> {
            log.info("🗑️ Deleting existing refresh token for user: {}", user.getEmail());
            refreshTokenRepository.delete(existingToken);
            refreshTokenRepository.flush(); // Force delete immediately
            log.info("✅ Existing refresh token deleted");
        });

        // 4. Generate new access token
        String accessToken = jwtService.generateToken(user);
        log.info("🔑 New access token generated for user: {}", user.getEmail());

        // 5. Generate new refresh token
        RefreshToken refreshToken = refreshTokenService.createRefreshToken(loginRequest.getEmail());
        log.info("🔑 New refresh token generated for user: {}", user.getEmail());

        log.info("✅ Login completed successfully for user: {} with role: {}",
                user.getEmail(), user.getRole().name());

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken.getRefreshToken())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole().name())
                .userId(user.getUserId())
                .build();
    }

    /**
     * Refresh access token using refresh token
     */
    @Transactional
    public AuthResponse refreshToken(String refreshTokenValue) {
        log.info("🔄 Refreshing token");

        // Verify refresh token
        RefreshToken refreshToken = refreshTokenService.verifyRefreshToken(refreshTokenValue);
        User user = refreshToken.getUser();

        log.info("✅ Refresh token verified for user: {}", user.getEmail());

        // Generate new access token
        String newAccessToken = jwtService.generateToken(user);
        log.info("🔑 New access token generated during refresh");

        return AuthResponse.builder()
                .accessToken(newAccessToken)
                .refreshToken(refreshToken.getRefreshToken())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole().name())
                .userId(user.getUserId())
                .build();
    }

    /**
     * Logout user - delete refresh token
     */
    @Transactional
    public void logout(String email) {
        log.info("🚪 Logout request for email: {}", email);

        userRepository.findByEmail(email).ifPresent(user -> {
            refreshTokenRepository.findByUser(user).ifPresent(token -> {
                refreshTokenRepository.delete(token);
                log.info("🗑️ Refresh token deleted for user: {}", email);
            });
        });

        log.info("✅ Logout completed for user: {}", email);
    }
}