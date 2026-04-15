package com.university.thesis.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class AddCouncilMemberRequest {

    @NotNull(message = "ID người dùng không được để trống")
    private Long userId;

    @NotBlank(message = "Vai trò thành viên không được để trống")
    private String memberRole;
}
