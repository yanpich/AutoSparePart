package com.real.autosparepart.auth.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Builder;

@Builder
public record MailBody (

        @Email(message = "Invalid email format")
        @NotBlank(message = "Recipient email is required")
        String to,

        @NotBlank(message = "Subject is required")
        String subject,

        @NotBlank(message = "Text is required")
        String text

) {}