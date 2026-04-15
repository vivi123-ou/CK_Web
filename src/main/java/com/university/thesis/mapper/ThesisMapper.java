package com.university.thesis.mapper;

import com.university.thesis.dto.response.ThesisResponse;
import com.university.thesis.entity.Thesis;
import com.university.thesis.entity.ThesisLecturer;
import com.university.thesis.entity.ThesisStudent;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class ThesisMapper {

    public ThesisResponse toResponse(Thesis thesis,
                                     List<ThesisStudent> students,
                                     List<ThesisLecturer> lecturers) {
        return toResponse(thesis, students, lecturers, null, null);
    }

    public ThesisResponse toResponse(Thesis thesis,
                                     List<ThesisStudent> students,
                                     List<ThesisLecturer> lecturers,
                                     String councilName,
                                     String councilStatus) {
        List<ThesisResponse.StudentInfo> studentInfos = students.stream()
                .map(ts -> ThesisResponse.StudentInfo.builder()
                        .id(ts.getStudent().getId())
                        .name(ts.getStudent().getFullName())
                        .email(ts.getStudent().getEmail())
                        .build())
                .collect(Collectors.toList());

        List<ThesisResponse.LecturerInfo> advisorInfos = lecturers.stream()
                .map(tl -> ThesisResponse.LecturerInfo.builder()
                        .id(tl.getLecturer().getId())
                        .name(tl.getLecturer().getFullName())
                        .email(tl.getLecturer().getEmail())
                        .build())
                .collect(Collectors.toList());

        ThesisResponse.ReviewerInfo reviewerInfo = null;
        if (thesis.getReviewer() != null) {
            reviewerInfo = ThesisResponse.ReviewerInfo.builder()
                    .id(thesis.getReviewer().getId())
                    .name(thesis.getReviewer().getFullName())
                    .email(thesis.getReviewer().getEmail())
                    .build();
        }

        return ThesisResponse.builder()
                .id(thesis.getId())
                .code("KL-" + thesis.getId())
                .title(thesis.getTitle())
                .description(thesis.getDescription())
                .year(thesis.getAcademicYear())
                .major(thesis.getMajor())
                .status(thesis.getStatus().name())
                .reviewer(reviewerInfo)
                .averageScore(thesis.getAverageScore())
                .gradeClassification(thesis.getGradeClassification())
                .students(studentInfos)
                .advisors(advisorInfos)
                .councilName(councilName)
                .councilStatus(councilStatus)
                .createdAt(thesis.getCreatedAt())
                .updatedAt(thesis.getUpdatedAt())
                .build();
    }
}
