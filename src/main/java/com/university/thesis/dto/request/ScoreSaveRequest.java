package com.university.thesis.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.util.List;

/**
 * Request DTO matching frontend scoreService.saveScore({thesisId, lecturerId, details, total})
 */
@Data
public class ScoreSaveRequest {

    @NotNull(message = "ID khóa luận không được để trống")
    private Long thesisId;

    private Long lecturerId;

    @Valid
    private List<ScoreDetail> details;

    private Double total;

    @Data
    public static class ScoreDetail {
        private Long criteriaId;
        private Double score;
    }
}
