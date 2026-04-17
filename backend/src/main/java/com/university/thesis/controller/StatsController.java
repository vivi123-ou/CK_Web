package com.university.thesis.controller;

import com.university.thesis.service.StatsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/statistics")
@RequiredArgsConstructor
public class StatsController {

    private final StatsService statsService;

    /**
     * GET /api/statistics/scores-by-year
     * Frontend expects: [ { year, avgScore, count }, ... ]
     */
    @GetMapping("/scores-by-year")
    public ResponseEntity<List<Map<String, Object>>> getScoresByYear() {
        return ResponseEntity.ok(statsService.getScoresByYear());
    }

    /**
     * GET /api/statistics/by-major
     * Frontend expects: [ { major, count }, ... ]
     */
    @GetMapping("/by-major")
    public ResponseEntity<List<Map<String, Object>>> getByMajor() {
        return ResponseEntity.ok(statsService.getByMajor());
    }

    /**
     * GET /api/statistics/overview
     */
    @GetMapping("/overview")
    public ResponseEntity<Map<String, Object>> getOverview() {
        return ResponseEntity.ok(statsService.getOverview());
    }
}
