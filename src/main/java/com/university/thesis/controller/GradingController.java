package com.university.thesis.controller;

import com.university.thesis.dto.request.ScoreSaveRequest;
import com.university.thesis.dto.response.*;
import com.university.thesis.entity.User;
import com.university.thesis.service.GradingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/scores")
@RequiredArgsConstructor
public class GradingController {

    private final GradingService gradingService;

    /**
     * GET /api/scores/thesis/{thesisId}
     * Frontend expects: [ { lecturerId, details, total, ... }, ... ]
     */
    @GetMapping("/thesis/{thesisId}")
    public ResponseEntity<List<GradeResponse>> getByThesis(@PathVariable Long thesisId) {
        return ResponseEntity.ok(gradingService.getScoresByThesis(thesisId));
    }

    /**
     * GET /api/scores/thesis/{thesisId}/summary
     */
    @GetMapping("/thesis/{thesisId}/summary")
    public ResponseEntity<ScoreSummaryResponse> getSummary(@PathVariable Long thesisId) {
        return ResponseEntity.ok(gradingService.getScoreSummary(thesisId));
    }

    /**
     * GET /api/scores/council/{councilId}
     */
    @GetMapping("/council/{councilId}")
    public ResponseEntity<CouncilGradeResponse> getByCouncil(@PathVariable Long councilId) {
        return ResponseEntity.ok(gradingService.getCouncilGrades(councilId));
    }

    /**
     * POST /api/scores
     */
    @PostMapping
    public ResponseEntity<GradeResponse> saveScore(
            @AuthenticationPrincipal User currentUser,
            @Valid @RequestBody ScoreSaveRequest request) {
        return ResponseEntity.ok(gradingService.saveScore(currentUser.getId(), request));
    }

    /**
     * PUT /api/scores/{id}
     */
    @PutMapping("/{id}")
    public ResponseEntity<GradeResponse> updateScore(
            @PathVariable Long id,
            @AuthenticationPrincipal User currentUser,
            @Valid @RequestBody ScoreSaveRequest request) {
        return ResponseEntity.ok(gradingService.updateScore(id, currentUser.getId(), request));
    }

    /**
     * GET /api/scores/assigned
     */
    @GetMapping("/assigned")
    public ResponseEntity<List<AssignedThesisResponse>> getAssigned(
            @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(gradingService.getAssignedTheses(currentUser.getId()));
    }

    /**
     * POST /api/scores/{id}/confirm
     */
    @PostMapping("/{id}/confirm")
    public ResponseEntity<GradeResponse> confirmGrade(
            @PathVariable Long id,
            @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(gradingService.confirmGrade(id, currentUser.getId()));
    }
}
