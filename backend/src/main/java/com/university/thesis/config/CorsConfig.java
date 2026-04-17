package com.university.thesis.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;

@Configuration
public class CorsConfig {

    /**
     * CorsConfigurationSource bean — được Spring Security 6 nhận qua
     * http.cors(cors -> cors.configurationSource(...))
     * Dùng CorsConfigurationSource thay CorsFilter để tránh xung đột order với Security filter chain.
     */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();

        // Cho phép gửi cookie / Authorization header
        config.setAllowCredentials(true);

        // Các origin cho phép (dev frontend)
        config.setAllowedOrigins(Arrays.asList(
            "http://localhost:5173",   // Vite dev server
            "http://localhost:3000"    // CRA / fallback
        ));

        // Liệt kê rõ các header thay vì dùng "*" (không hợp lệ khi credentials=true)
        config.setAllowedHeaders(Arrays.asList(
            "Authorization", "Content-Type", "Accept",
            "X-Requested-With", "Cache-Control"
        ));

        config.setAllowedMethods(Arrays.asList(
            "GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"
        ));

        // Cho phép frontend đọc header Authorization từ response
        config.setExposedHeaders(Arrays.asList("Authorization"));

        // Cache preflight 1 giờ, tránh browser gửi OPTIONS liên tục
        config.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}
