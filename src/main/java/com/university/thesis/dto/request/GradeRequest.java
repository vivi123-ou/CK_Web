package com.university.thesis.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.Data;
import java.util.List;

/**
 * Unified DTO cho cả submit và draft grade.
 * Validation nghiêm ngặt (all criteria required) được xử lý ở service layer,
 * không phải ở DTO level — để tránh lãng phí 2 DTO gần giống nhau.
 */
@Data
public class GradeRequest {

    @NotNull(message = "ID hội đồng không được để trống")
    private Long councilId;

    @NotNull(message = "ID khóa luận không được để trống")
    private Long thesisId;

    @Valid
    private List<GradeItem> grades;

    @Data
    public static class GradeItem {
        @NotNull(message = "ID tiêu chí không được để trống")
        private Long criteriaId;

        @NotNull(message = "Điểm không được để trống")
        @DecimalMin(value = "0.0", message = "Điểm phải >= 0")
        @DecimalMax(value = "10.0", message = "Điểm phải <= 10")
        private Double score;
    }
}
