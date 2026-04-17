package com.university.thesis.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class UpdateThesisRequest {

    @Size(min = 10, max = 200, message = "Tên khóa luận phải từ 10 đến 200 ký tự")
    private String title;

    private String description;

    private Integer year;

    private String major;
}
