package com.university.thesis.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class AssignReviewerRequest {

    @NotNull(message = "ID giảng viên phản biện không được để trống")
    private Long lecturerId;
}
