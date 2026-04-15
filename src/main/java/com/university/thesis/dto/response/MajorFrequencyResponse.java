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
public class MajorFrequencyResponse {
    private List<MajorStats> data;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MajorStats {
        private String major;
        private long count;
        private double percentage;
    }
}
