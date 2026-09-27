package com.real.autosparepart.security.filter;

import com.real.autosparepart.security.jwt.JwtService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;

    public JwtAuthenticationFilter(JwtService jwtService, UserDetailsService userDetailsService) {
        this.jwtService = jwtService;
        this.userDetailsService = userDetailsService;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {

        final String authHeader = request.getHeader("Authorization");
        final String requestPath = request.getServletPath();

        // Skip authentication for public endpoints
        if (isPublicEndpoint(requestPath) || request.getMethod().equals("OPTIONS")) {
            filterChain.doFilter(request, response);
            return;
        }

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        final String jwt = authHeader.substring(7);

        try {
            final String userEmail = jwtService.extractUsername(jwt);

            if (userEmail != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                UserDetails userDetails = this.userDetailsService.loadUserByUsername(userEmail);
                System.out.println("Loaded user: " + userDetails.getUsername());
                System.out.println("User authorities from DB: " + userDetails.getAuthorities());

                if (jwtService.isTokenValid(jwt, userDetails)) {
                    // ✅ Extract roles from JWT and ensure they have ROLE_ prefix
                    List<String> roles = jwtService.extractRoles(jwt);

                    List<SimpleGrantedAuthority> authorities;
                    if (roles != null && !roles.isEmpty()) {
                        authorities = roles.stream()
                                .map(role -> {
                                    // Ensure role has ROLE_ prefix
                                    if (!role.startsWith("ROLE_")) {
                                        return new SimpleGrantedAuthority("ROLE_" + role);
                                    }
                                    return new SimpleGrantedAuthority(role);
                                })
                                .collect(Collectors.toList());
                        System.out.println("✅ Using roles from JWT with ROLE_ prefix: " + authorities);
                    } else {
                        // Fallback to UserDetails authorities
                        authorities = userDetails.getAuthorities().stream()
                                .map(auth -> new SimpleGrantedAuthority(auth.getAuthority()))
                                .collect(Collectors.toList());
                        System.out.println("✅ Using roles from UserDetails: " + authorities);
                    }

                    UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                            userDetails,
                            null,
                            authorities
                    );
                    authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authToken);

                    System.out.println("✅ Authentication set successfully");
                    System.out.println("✅ Authorities in context: " + SecurityContextHolder.getContext().getAuthentication().getAuthorities());
                }
            }
        } catch (Exception e) {
            System.err.println("❌ JWT authentication failed: " + e.getMessage());
            e.printStackTrace();
        }

        filterChain.doFilter(request, response);
    }

    private boolean isPublicEndpoint(String path) {
        return path.equals("/api/auth/login") ||
                path.equals("/api/auth/register") ||
                path.equals("/api/auth/refresh") ||
                path.startsWith("/forgotPassword") ||
                path.equals("/error") ||
                path.startsWith("/api/files/download") ||
                path.startsWith("/uploads/");
    }
}