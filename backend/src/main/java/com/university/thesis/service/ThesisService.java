package com.university.thesis.service;

import com.university.thesis.dto.request.*;
import com.university.thesis.dto.response.ThesisResponse;

import java.util.List;

public interface ThesisService {

    ThesisResponse createThesis(CreateThesisRequest request);
    ThesisResponse updateThesis(Long thesisId, UpdateThesisRequest request);
    void deleteThesis(Long thesisId);
    List<ThesisResponse> getAllTheses();
    ThesisResponse getThesisById(Long thesisId);
    List<ThesisResponse> searchTheses(String keyword, String year, String major);
    ThesisResponse assignReviewer(Long thesisId, AssignReviewerRequest request);
    List<ThesisResponse> getByStudent(Long studentId);
    List<ThesisResponse> getByLecturer(Long lecturerId);
}
