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
public class CouncilGradeResponse {
    private Long councilId;
    private String councilName;
    private List<ThesisGrade> thesisGrades;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ThesisGrade {
        private Long thesisId;
        private String thesisTitle;
        private Double averageScore;
        private String classification;
        private List<LecturerGrade> lecturerGrades;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class LecturerGrade {
        private Long lecturerId;
        private String lecturerName;
        private Double totalScore;
        private boolean confirmed;
    }
}
