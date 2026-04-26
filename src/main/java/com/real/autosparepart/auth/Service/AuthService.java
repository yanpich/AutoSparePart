package com.real.autosparepart.auth.Service;

import com.real.autosparepart.auth.dto.request.LoginRequest;
import com.real.autosparepart.auth.dto.request.RegisterRequest;
import com.real.autosparepart.auth.dto.response.AuthResponse;
import com.real.autosparepart.auth.entity.User;
import com.real.autosparepart.auth.entity.UserRole;
import com.real.autosparepart.auth.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final RefreshTokenService refreshTokenService;

                .role(UserRole.USER)
                .build();
    }



    }
}
