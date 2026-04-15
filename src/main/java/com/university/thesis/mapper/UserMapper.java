package com.university.thesis.mapper;

import com.university.thesis.dto.response.JwtResponse;
import com.university.thesis.dto.response.UserProfileResponse;
import com.university.thesis.dto.response.UserResponse;
import com.university.thesis.entity.User;
import org.springframework.stereotype.Component;

@Component
public class UserMapper {

    public UserResponse toResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .name(user.getFullName())
                .phone(user.getPhone())
                .role(normalizeRole(user.getRole().name()))
                .status(user.getStatus().name())
                .createdAt(user.getCreatedAt())
                .build();
    }

    public UserProfileResponse toProfileResponse(User user) {
        return UserProfileResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .name(user.getFullName())
                .phone(user.getPhone())
                .role(normalizeRole(user.getRole().name()))
                .build();
    }

    public JwtResponse toJwtResponse(User user, String token) {
        return JwtResponse.builder()
                .token(token)
                .user(JwtResponse.UserInfo.builder()
                        .id(user.getId())
                        .name(user.getFullName())
                        .email(user.getEmail())
                        .role(normalizeRole(user.getRole().name()))
                        .build())
                .build();
    }

    /**
     * Convert backend role names (GIAO_VU, GIANG_VIEN, SINH_VIEN) 
     * to frontend format (GIAOVU, GIANGVIEN, SINHVIEN)
     */
    public static String normalizeRole(String role) {
        if (role == null) return null;
        return role.replace("_", "");
    }
}
