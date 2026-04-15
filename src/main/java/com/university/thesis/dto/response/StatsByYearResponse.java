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
public class StatsByYearResponse {
    private List<YearStats> data;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class YearStats {
        private String year;
        private long totalTheses;
        private double averageScore;
        private long excellent;
        private long good;
        private long fair;
        private long average;
        private long weak;
    }
}
