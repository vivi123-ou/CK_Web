package com.university.thesis.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;
import java.util.List;

@Data
public class CreateThesisRequest {

    @NotBlank(message = "Tên khóa luận không được để trống")
    @Size(min = 10, max = 200, message = "Tên khóa luận phải từ 10 đến 200 ký tự")
    private String title;

    private String description;

    private String major;

    private Integer year;

    @NotEmpty(message = "Phải có ít nhất 1 sinh viên")
    @Size(min = 1, max = 3, message = "Số lượng sinh viên phải từ 1 đến 3")
    private List<Long> studentIds;

    @NotEmpty(message = "Phải có ít nhất 1 giảng viên hướng dẫn")
    @Size(min = 1, max = 2, message = "Số lượng GVHD phải từ 1 đến 2")
    private List<Long> advisorIds;
}
