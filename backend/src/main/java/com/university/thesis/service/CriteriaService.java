package com.university.thesis.service;

import com.university.thesis.dto.request.CreateCriteriaRequest;
import com.university.thesis.dto.response.CriteriaResponse;

import java.util.List;

public interface CriteriaService {

    List<CriteriaResponse> getAll();
    CriteriaResponse create(CreateCriteriaRequest request);
    CriteriaResponse update(Long id, CreateCriteriaRequest request);
    void delete(Long id);
}
