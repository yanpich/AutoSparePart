package com.real.autosparepart.config;

import com.real.autosparepart.security.filter.JwtAuthenticationFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
public class SecurityConfiguration {

    private final JwtAuthenticationFilter jwtAuthFilter;

    public SecurityConfiguration(JwtAuthenticationFilter jwtAuthFilter) {
        this.jwtAuthFilter = jwtAuthFilter;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .authorizeHttpRequests(authz -> authz
                        // ============================================
                        // PUBLIC ENDPOINTS - No authentication required
                        // ============================================
                        .requestMatchers(
                                "/api/auth/login",
                                "/api/auth/register",
                                "/api/auth/refresh",
                                "/api/auth/**"
                        ).permitAll()

                        .requestMatchers(
                                "/forgotPassword/**",
                                "/api/forgotPassword/**"
                        ).permitAll()

                        .requestMatchers(
                                "/",
                                "/index.html",
                                "/static/**",
                                "/public/**",
                                "/css/**",
                                "/js/**",
                                "/images/**",
                                "/favicon.ico",
                                "/error"
                        ).permitAll()

                        .requestMatchers(
                                "/api/files/download/**",
                                "/api/files/view/**",
                                "/uploads/**"
                        ).permitAll()

                        .requestMatchers(
                                "/swagger-ui/**",
                                "/v3/api-docs/**",
                                "/swagger-ui.html"
                        ).permitAll()

                        .requestMatchers("/actuator/health", "/actuator/info").permitAll()
                        .requestMatchers("/test/**", "/api/test/**").permitAll()

                        // ============================================
                        // USER & ADMIN ENDPOINTS - Both can access
                        // ============================================
                        .requestMatchers(HttpMethod.GET, "/api/dashboard/**").hasAnyRole("ADMIN", "USER")

                        // Brands - GET for both, POST/PUT/DELETE for ADMIN only
                        .requestMatchers(HttpMethod.GET, "/api/admin/brands/**").hasAnyRole("ADMIN", "USER")
                        .requestMatchers(HttpMethod.POST, "/api/admin/brands/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/admin/brands/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/admin/brands/**").hasRole("ADMIN")

                        // Categories - GET for both, POST/PUT/DELETE for ADMIN only
                        .requestMatchers(HttpMethod.GET, "/api/admin/categories/**").hasAnyRole("ADMIN", "USER")
                        .requestMatchers(HttpMethod.POST, "/api/admin/categories/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/admin/categories/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/admin/categories/**").hasRole("ADMIN")

                        // Vehicles - GET for both, POST/PUT/DELETE for ADMIN only
                        .requestMatchers(HttpMethod.GET, "/api/admin/vehicles/**").hasAnyRole("ADMIN", "USER")
                        .requestMatchers(HttpMethod.POST, "/api/admin/vehicles/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/admin/vehicles/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/admin/vehicles/**").hasRole("ADMIN")

                        // Products - GET for both, POST/PUT/DELETE for ADMIN only
                        .requestMatchers(HttpMethod.GET, "/api/admin/products/**").hasAnyRole("ADMIN", "USER")
                        .requestMatchers(HttpMethod.POST, "/api/admin/products/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/admin/products/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/admin/products/**").hasRole("ADMIN")

                        // ============================================
                        // ADMIN ONLY ENDPOINTS - Only ADMIN can access
                        // ============================================
                        // User Management - ADMIN only
                        .requestMatchers("/api/admin/users/**").hasRole("ADMIN")

                        // File upload/delete - ADMIN only
                        .requestMatchers(HttpMethod.POST, "/api/files/upload/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/files/delete/**").hasRole("ADMIN")

                        // ============================================
                        // DEFAULT - All other requests require authentication
                        // ============================================
                        .anyRequest().authenticated()
                )
                .sessionManagement(session -> session
                        .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                )
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(Arrays.asList(
                "http://localhost:3000",
                "http://localhost:3001",
                "http://localhost:5173",
                "http://127.0.0.1:3000",
                "http://127.0.0.1:5173"
        ));
        configuration.setAllowedMethods(Arrays.asList(
                "GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS", "HEAD"
        ));
        configuration.setAllowedHeaders(Arrays.asList(
                "Authorization", "Content-Type", "X-Requested-With", "Accept",
                "Origin", "Access-Control-Request-Method", "Access-Control-Request-Headers"
        ));
        configuration.setExposedHeaders(Arrays.asList(
                "Authorization", "X-Total-Count", "X-Page-Total"
        ));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}