package com.university.thesis.mapper;

import com.university.thesis.dto.response.CouncilDetailResponse;
import com.university.thesis.entity.*;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class CouncilMapper {

    public CouncilDetailResponse toDetailResponse(Council council,
                                                   List<CouncilMember> members,
                                                   List<CouncilThesis> councilTheses,
                                                   List<Criteria> criteria) {
        List<CouncilDetailResponse.MemberInfo> memberInfos = members.stream()
                .map(m -> CouncilDetailResponse.MemberInfo.builder()
                        .lecturerId(m.getUser().getId())
                        .lecturerName(m.getUser().getFullName())
                        .lecturerEmail(m.getUser().getEmail())
                        .councilRole(m.getMemberRole().name())
                        .build())
                .collect(Collectors.toList());

        List<CouncilDetailResponse.ThesisInfo> thesisInfos = councilTheses.stream()
                .map(ct -> {
                    Thesis thesis = ct.getThesis();
                    List<CouncilDetailResponse.StudentInfo> students = thesis.getStudents().stream()
                            .map(ts -> CouncilDetailResponse.StudentInfo.builder()
                                    .id(ts.getStudent().getId())
                                    .name(ts.getStudent().getFullName())
                                    .build())
                            .collect(Collectors.toList());

                    return CouncilDetailResponse.ThesisInfo.builder()
                            .id(thesis.getId())
                            .title(thesis.getTitle())
                            .status(thesis.getStatus().name())
                            .students(students)
                            .avgScore(thesis.getAverageScore())
                            .build();
                })
                .collect(Collectors.toList());

        List<CouncilDetailResponse.CriteriaInfo> criteriaInfos = criteria.stream()
                .map(c -> CouncilDetailResponse.CriteriaInfo.builder()
                        .id(c.getId())
                        .name(c.getName())
                        .weightPercent(c.getWeightPercent())
                        .build())
                .collect(Collectors.toList());

        return CouncilDetailResponse.builder()
                .id(council.getId())
                .name(council.getName())
                .date(council.getDefenseDate() != null ? council.getDefenseDate().toString() : null)
                .room(council.getLocation())
                .status(council.getStatus().name())
                .members(memberInfos)
                .theses(thesisInfos)
                .criteria(criteriaInfos)
                .createdAt(council.getCreatedAt())
                .build();
    }
}
