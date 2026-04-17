package com.university.thesis.config;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfigurationSource;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final CorsConfigurationSource corsConfigurationSource;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource))
                .csrf(csrf -> csrf.disable())
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        .requestMatchers(HttpMethod.POST, "/auth/login").permitAll()

                        // Statistics
                        .requestMatchers("/statistics/**").hasAnyRole("ADMIN", "GIAO_VU")
                        .requestMatchers("/reports/**").hasRole("GIAO_VU")

                        // User management
                        .requestMatchers("/users/profile", "/users/change-password").authenticated()
                        .requestMatchers(HttpMethod.GET, "/users").hasAnyRole("ADMIN", "GIAO_VU")
                        .requestMatchers("/users/**").hasRole("ADMIN")

                        // Council, Thesis, Criteria
                        .requestMatchers(HttpMethod.POST, "/councils/**", "/thesis/**", "/criteria/**").hasAnyRole("GIAO_VU", "ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/councils/**", "/thesis/**", "/criteria/**").hasAnyRole("GIAO_VU", "ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/councils/**", "/thesis/**", "/criteria/**").hasAnyRole("GIAO_VU", "ADMIN")

                        // Grading
                        .requestMatchers(HttpMethod.POST, "/scores/**").hasRole("GIANG_VIEN")
                        .requestMatchers(HttpMethod.PUT, "/scores/**").hasRole("GIANG_VIEN")

                        .anyRequest().authenticated()
                )
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}