package com.university.thesis.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

/**
 * Response for GET /scores/thesis/{id}/summary
 * Matches frontend SinhvienDashboard.ScoreView expectations
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ScoreSummaryResponse {
    private Long thesisId;
    private String thesisTitle;
    private Double avgScore;
    private String classification;
    private List<CriteriaInfo> criteria;
    private List<MemberScore> memberScores;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CriteriaInfo {
        private Long id;
        private String name;
        private Integer weightPercent;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MemberScore {
        private Long lecturerId;
        private String lecturerName;
        private String councilRole;
        private Double total;
        private List<ScoreDetail> details;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ScoreDetail {
        private Long criteriaId;
        private Double score;
    }
}
