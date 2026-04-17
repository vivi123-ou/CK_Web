package com.university.thesis.service.impl;

import com.university.thesis.dto.request.CreateCriteriaRequest;
import com.university.thesis.dto.response.CriteriaResponse;
import com.university.thesis.entity.Criteria;
import com.university.thesis.exception.BusinessException;
import com.university.thesis.exception.ResourceNotFoundException;
import com.university.thesis.repository.CriteriaRepository;
import com.university.thesis.repository.GradeDetailRepository;
import com.university.thesis.service.CriteriaService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CriteriaServiceImpl implements CriteriaService {

    private final CriteriaRepository criteriaRepository;
    private final GradeDetailRepository gradeDetailRepository;

    @Override
    public List<CriteriaResponse> getAll() {
        return criteriaRepository.findAll().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public CriteriaResponse create(CreateCriteriaRequest request) {
        Criteria criteria = Criteria.builder()
                .name(request.getName())
                .description(request.getDescription())
                .weightPercent(request.getMaxScore() != null ? request.getMaxScore().intValue() : 10)
                .build();
        criteriaRepository.save(criteria);
        return toResponse(criteria);
    }

    @Override
    @Transactional
    public CriteriaResponse update(Long id, CreateCriteriaRequest request) {
        Criteria criteria = criteriaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy tiêu chí ID: " + id));
        if (request.getName() != null) criteria.setName(request.getName());
        if (request.getDescription() != null) criteria.setDescription(request.getDescription());
        if (request.getMaxScore() != null) criteria.setWeightPercent(request.getMaxScore().intValue());
        criteriaRepository.save(criteria);
        return toResponse(criteria);
    }

    @Override
    @Transactional
    public void delete(Long id) {
        if (gradeDetailRepository.existsByCriteriaId(id)) {
            throw new BusinessException("Không thể xóa tiêu chí này vì đã có dữ liệu chấm điểm");
        }
        Criteria criteria = criteriaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy tiêu chí ID: " + id));
        criteriaRepository.delete(criteria);
    }

    private CriteriaResponse toResponse(Criteria c) {
        return CriteriaResponse.builder()
                .id(c.getId())
                .name(c.getName())
                .description(c.getDescription())
                .maxScore(c.getWeightPercent() != null ? c.getWeightPercent().doubleValue() : null)
                .councilId(c.getCouncil() != null ? c.getCouncil().getId() : null)
                .build();
    }
}
