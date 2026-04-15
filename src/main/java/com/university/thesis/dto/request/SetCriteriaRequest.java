package com.university.thesis.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.Data;
import java.util.List;

@Data
public class SetCriteriaRequest {

    @NotEmpty(message = "Danh sách tiêu chí không được để trống")
    @Valid
    private List<CriteriaItem> criteria;

    @Data
    public static class CriteriaItem {
        @NotBlank(message = "Tên tiêu chí không được để trống")
        private String name;

        @NotNull(message = "Trọng số không được để trống")
        @Min(value = 1, message = "Trọng số phải >= 1%")
        @Max(value = 100, message = "Trọng số phải <= 100%")
        private Integer weightPercent;
    }
}
