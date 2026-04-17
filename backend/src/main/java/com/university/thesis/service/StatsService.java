package com.university.thesis.service;

import java.util.List;
import java.util.Map;

public interface StatsService {

    List<Map<String, Object>> getScoresByYear();
    List<Map<String, Object>> getByMajor();
    Map<String, Object> getOverview();
}
