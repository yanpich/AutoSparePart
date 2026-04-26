package com.real.autosparepart.auth.dto.response;

import lombok.Builder;

@Builder
public record AuthResponse(
        String accessToken,
        String refreshToken,
        String name,
        String email
) {}