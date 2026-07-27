package com.real.autosparepart.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserDTO {
    private Integer userId;
    private String fullName;
    private String username;
    private String email;
    private String password;
    private String phone;
    private String role;
    private String status;
    private String address;
    private String createdAt;
    private String updatedAt;
}