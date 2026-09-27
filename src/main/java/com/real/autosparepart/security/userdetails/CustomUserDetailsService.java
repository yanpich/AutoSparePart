package com.real.autosparepart.security.userdetails;

import com.real.autosparepart.user.entity.User;
import com.real.autosparepart.user.repository.UserRepository;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    public CustomUserDetailsService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        // ✅ Only load non-deleted users
        User user = userRepository.findByEmailAndNotDeleted(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));

        System.out.println("========== Load User Details ==========");
        System.out.println("Email: " + user.getEmail());
        System.out.println("Role from DB: " + user.getRole());
        System.out.println("Deleted: " + (user.isDeleted() ? "YES" : "NO"));
        System.out.println("Account Enabled: " + user.isEnabled());
        System.out.println("Account Non-Locked: " + user.isAccountNonLocked());

        // ✅ CRITICAL: Add ROLE_ prefix - Spring Security requires this
        String roleWithPrefix = "ROLE_" + user.getRole().name();
        System.out.println("Role with ROLE_ prefix: " + roleWithPrefix);
        System.out.println("=======================================");

        // ✅ Build UserDetails with account status from User entity
        return org.springframework.security.core.userdetails.User.builder()
                .username(user.getEmail())
                .password(user.getPassword())
                .authorities(new SimpleGrantedAuthority(roleWithPrefix))
                .accountExpired(!user.isAccountNonExpired())
                .accountLocked(!user.isAccountNonLocked())
                .credentialsExpired(!user.isCredentialsNonExpired())
                .disabled(!user.isEnabled())
                .build();
    }
}