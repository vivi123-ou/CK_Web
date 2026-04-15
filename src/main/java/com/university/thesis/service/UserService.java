package com.university.thesis.service;

import com.university.thesis.dto.request.*;
import com.university.thesis.dto.response.UserProfileResponse;
import com.university.thesis.dto.response.UserResponse;

import java.util.List;

public interface UserService {

    // Profile operations
    UserProfileResponse getProfile(Long userId);
    UserProfileResponse updateProfile(Long userId, UpdateProfileRequest request);
    void changePassword(Long userId, ChangePasswordRequest request);

    // Admin operations
    List<UserResponse> getAllUsers(String role);
    UserResponse getUserById(Long userId);
    UserResponse createUser(CreateUserRequest request);
    UserResponse updateUser(Long userId, UpdateUserRequest request);
    void deleteUser(Long userId);
    UserResponse assignRole(Long userId, AssignRoleRequest request);
    void resetPassword(Long userId);
}
