package com.university.thesis.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class AssignRoleRequest {

    @NotBlank(message = "Vai trò không được để trống")
    private String role;
}
