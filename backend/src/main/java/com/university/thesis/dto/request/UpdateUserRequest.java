package com.university.thesis.dto.request;

import jakarta.validation.constraints.Email;
import lombok.Data;

@Data
public class UpdateUserRequest {

    private String name;

    private String phone;

    @Email(message = "Email không đúng định dạng")
    private String email;

    private String role;

    private String status;
}
