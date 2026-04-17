package com.university.thesis.mapper;

import com.university.thesis.dto.response.GradeResponse;
import com.university.thesis.entity.Grade;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class GradeMapper {

    public GradeResponse toResponse(Grade grade) {
        List<GradeResponse.DetailInfo> details = grade.getDetails().stream()
                .map(d -> GradeResponse.DetailInfo.builder()
                        .criteriaId(d.getCriteria().getId())
                        .criteriaName(d.getCriteria().getName())
                        .weightPercent(d.getCriteria().getWeightPercent())
                        .score(d.getScore())
                        .weightedScore(Math.round(d.getScore() * d.getCriteria().getWeightPercent() / 100.0 * 10.0) / 10.0)
                        .build())
                .collect(Collectors.toList());

        return GradeResponse.builder()
                .id(grade.getId())
                .councilId(grade.getCouncil().getId())
                .thesisId(grade.getThesis().getId())
                .thesisTitle(grade.getThesis().getTitle())
                .lecturerId(grade.getLecturer().getId())
                .lecturerName(grade.getLecturer().getFullName())
                .total(grade.getTotalScore())
                .draft(grade.isDraft())
                .confirmed(grade.isConfirmed())
                .details(details)
                .build();
    }
}
