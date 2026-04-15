package com.university.thesis.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GradeResponse {
    private Long id;
    private Long councilId;
    private Long thesisId;
    private String thesisTitle;
    private Long lecturerId;
    private String lecturerName;
    private Double total;
    private boolean draft;
    private boolean confirmed;
    private List<DetailInfo> details;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DetailInfo {
        private Long criteriaId;
        private String criteriaName;
        private Integer weightPercent;
        private Double score;
        private Double weightedScore;
    }
}
