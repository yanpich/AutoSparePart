package com.real.autosparepart.user.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

@Entity
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Table(name = "refresh_token",
        uniqueConstraints = @UniqueConstraint(columnNames = "user_id"))
public class RefreshToken {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer tokenId;

    @Column(nullable = false, length = 500, unique = true)
    @NotBlank(message = "Please enter refresh token value!")
    private String refreshToken;

    @Column(nullable = false)
    private Instant expirationTime;

    @OneToOne
    @JoinColumn(name = "user_id", unique = true)
    private User user;

    public void setUser(User user) {
        this.user = user;
        if (user != null && user.getRefreshToken() != this) {
            user.setRefreshToken(this);
        }
    }

    @PreRemove
    private void preRemove() {
        if (user != null && user.getRefreshToken() == this) {
            user.setRefreshToken(null);
        }
    }
}