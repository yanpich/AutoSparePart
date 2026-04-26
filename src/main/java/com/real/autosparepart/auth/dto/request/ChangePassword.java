package com.real.autosparepart.auth.dto.request;

public record ChangePassword(
        String password,
        String repeatPassword) {
}
