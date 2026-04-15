package com.university.thesis.service;

import com.university.thesis.dto.request.GradeRequest;
import com.university.thesis.dto.request.ScoreSaveRequest;
import com.university.thesis.dto.response.AssignedThesisResponse;
import com.university.thesis.dto.response.CouncilGradeResponse;
import com.university.thesis.dto.response.GradeResponse;
import com.university.thesis.dto.response.ScoreSummaryResponse;

import java.util.List;

public interface GradingService {

    List<AssignedThesisResponse> getAssignedTheses(Long lecturerId);
    GradeResponse submitGrade(Long lecturerId, GradeRequest request);
    GradeResponse saveDraft(Long lecturerId, GradeRequest request);
    GradeResponse confirmGrade(Long gradeId, Long lecturerId);
    CouncilGradeResponse getCouncilGrades(Long councilId);

    // New endpoints for frontend compatibility
    List<GradeResponse> getScoresByThesis(Long thesisId);
    ScoreSummaryResponse getScoreSummary(Long thesisId);
    GradeResponse saveScore(Long lecturerId, ScoreSaveRequest request);
    GradeResponse updateScore(Long gradeId, Long lecturerId, ScoreSaveRequest request);
}
