package com.real.autosparepart.auth.controller;

import com.real.autosparepart.auth.Service.AuthService;
import com.real.autosparepart.security.jwt.JwtService;
import com.real.autosparepart.user.service.RefreshTokenService;
import com.real.autosparepart.auth.dto.request.LoginRequest;
import com.real.autosparepart.auth.dto.request.RefreshTokenRequest;
import com.real.autosparepart.auth.dto.request.RegisterRequest;
import com.real.autosparepart.auth.dto.response.AuthResponse;
import com.real.autosparepart.user.entity.RefreshToken;
import com.real.autosparepart.user.entity.User;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    private final AuthService authService;
    private final RefreshTokenService refreshTokenService;
    private final JwtService jwtService;

    public AuthController(AuthService authService, RefreshTokenService refreshTokenService, JwtService jwtService) {
        this.authService = authService;
        this.refreshTokenService = refreshTokenService;
        this.jwtService = jwtService;
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@RequestBody RegisterRequest registerRequest) {
        return ResponseEntity.ok(authService.register(registerRequest));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest loginRequest) {
        return ResponseEntity.ok(authService.login(loginRequest));
    }

    @PostMapping("/refresh")
    public ResponseEntity<AuthResponse> refreshToken(@RequestBody RefreshTokenRequest refreshTokenRequest) {
        RefreshToken refreshToken = refreshTokenService.verifyRefreshToken(refreshTokenRequest.getRefreshToken());
        User user = refreshToken.getUser();
        String accessToken = jwtService.generateToken(user);

        return ResponseEntity.ok(AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken.getRefreshToken())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole().name())
                .userId(user.getUserId())
                .build());
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        authService.logout(email);
        return ResponseEntity.ok(Map.of("message", "Logged out successfully"));
    }
}
