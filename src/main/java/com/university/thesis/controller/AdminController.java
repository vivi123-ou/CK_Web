package com.university.thesis.controller;

import com.university.thesis.dto.request.AssignRoleRequest;
import com.university.thesis.dto.request.CreateUserRequest;
import com.university.thesis.dto.request.UpdateUserRequest;
import com.university.thesis.dto.response.UserResponse;
import com.university.thesis.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
public class AdminController {

    private final UserService userService;

    /**
     * GET /api/users
     * Frontend expects: [ { id, name, email, role, status, ... }, ... ]
     */
    @GetMapping
    public ResponseEntity<List<UserResponse>> getAllUsers(
            @RequestParam(required = false) String role) {
        return ResponseEntity.ok(userService.getAllUsers(role));
    }

    /**
     * GET /api/users/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<UserResponse> getUserById(@PathVariable Long id) {
        return ResponseEntity.ok(userService.getUserById(id));
    }

    /**
     * POST /api/users
     */
    @PostMapping
    public ResponseEntity<UserResponse> createUser(
            @Valid @RequestBody CreateUserRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(userService.createUser(request));
    }

    /**
     * PUT /api/users/{id}
     */
    @PutMapping("/{id}")
    public ResponseEntity<UserResponse> updateUser(
            @PathVariable Long id,
            @Valid @RequestBody UpdateUserRequest request) {
        return ResponseEntity.ok(userService.updateUser(id, request));
    }

    /**
     * DELETE /api/users/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.ok().build();
    }

    /**
     * PATCH /api/users/{id}/role
     */
    @PatchMapping("/{id}/role")
    public ResponseEntity<UserResponse> assignRole(
            @PathVariable Long id,
            @Valid @RequestBody AssignRoleRequest request) {
        return ResponseEntity.ok(userService.assignRole(id, request));
    }

    /**
     * POST /api/users/{id}/reset-pw
     */
    @PostMapping("/{id}/reset-pw")
    public ResponseEntity<Void> resetPassword(@PathVariable Long id) {
        userService.resetPassword(id);
        return ResponseEntity.ok().build();
    }

    /**
     * POST /api/users/{id}/avatar
     */
    @PostMapping("/{id}/avatar")
    public ResponseEntity<Void> uploadAvatar(@PathVariable Long id) {
        return ResponseEntity.ok().build();
    }
}
