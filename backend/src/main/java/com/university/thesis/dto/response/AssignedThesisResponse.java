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
public class AssignedThesisResponse {
    private Long councilId;
    private String councilName;
    private String councilStatus;
    private List<ThesisItem> theses;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ThesisItem {
        private Long thesisId;
        private String title;
        private String status;
        private boolean hasGraded;
        private boolean confirmed;
    }
}
