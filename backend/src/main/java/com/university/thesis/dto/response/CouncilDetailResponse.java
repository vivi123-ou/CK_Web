package com.university.thesis.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CouncilDetailResponse {
    private Long id;
    private String name;
    private String date;
    private String room;
    private String status;
    private List<MemberInfo> members;
    private List<ThesisInfo> theses;
    private List<CriteriaInfo> criteria;
    private LocalDateTime createdAt;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MemberInfo {
        private Long lecturerId;
        private String lecturerName;
        private String lecturerEmail;
        private String councilRole;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ThesisInfo {
        private Long id;
        private String title;
        private String status;
        private List<StudentInfo> students;
        private Double avgScore;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class StudentInfo {
        private Long id;
        private String name;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CriteriaInfo {
        private Long id;
        private String name;
        private Integer weightPercent;
    }
}
