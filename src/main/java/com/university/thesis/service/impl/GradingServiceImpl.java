package com.university.thesis.service.impl;

import com.university.thesis.dto.request.GradeRequest;
import com.university.thesis.dto.request.ScoreSaveRequest;
import com.university.thesis.dto.response.*;
import com.university.thesis.entity.*;
import com.university.thesis.exception.BusinessException;
import com.university.thesis.exception.ResourceNotFoundException;
import com.university.thesis.mapper.GradeMapper;
import com.university.thesis.repository.*;
import com.university.thesis.service.GradingService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class GradingServiceImpl implements GradingService {

    private final GradeRepository gradeRepository;
    private final GradeDetailRepository gradeDetailRepository;
    private final CouncilMemberRepository councilMemberRepository;
    private final CouncilThesisRepository councilThesisRepository;
    private final CouncilRepository councilRepository;
    private final CriteriaRepository criteriaRepository;
    private final ThesisRepository thesisRepository;
    private final UserRepository userRepository;
    private final GradeMapper gradeMapper;

    // ==================== Frontend-compatible endpoints ====================

    @Override
    @Transactional(readOnly = true)
    public List<GradeResponse> getScoresByThesis(Long thesisId) {
        List<Grade> grades = gradeRepository.findByThesisId(thesisId);
        return grades.stream().map(gradeMapper::toResponse).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public ScoreSummaryResponse getScoreSummary(Long thesisId) {
        Thesis thesis = thesisRepository.findById(thesisId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy khóa luận ID: " + thesisId));

        List<Grade> grades = gradeRepository.findByThesisId(thesisId);

        // Get criteria from the council this thesis belongs to
        List<CouncilThesis> cts = councilThesisRepository.findByThesisId(thesisId);
        List<Criteria> criteriaList = new ArrayList<>();
        if (!cts.isEmpty()) {
            criteriaList = criteriaRepository.findByCouncilId(cts.get(0).getCouncil().getId());
        }

        List<ScoreSummaryResponse.CriteriaInfo> criteriaInfos = criteriaList.stream()
                .map(c -> ScoreSummaryResponse.CriteriaInfo.builder()
                        .id(c.getId())
                        .name(c.getName())
                        .weightPercent(c.getWeightPercent())
                        .build())
                .collect(Collectors.toList());

        List<ScoreSummaryResponse.MemberScore> memberScores = grades.stream()
                .map(g -> {
                    // Find council role
                    String councilRole = "";
                    if (!cts.isEmpty()) {
                        Optional<CouncilMember> cm = councilMemberRepository
                                .findByCouncilIdAndUserId(cts.get(0).getCouncil().getId(), g.getLecturer().getId());
                        councilRole = cm.map(m -> m.getMemberRole().name()).orElse("");
                    }

                    List<ScoreSummaryResponse.ScoreDetail> details = g.getDetails().stream()
                            .map(d -> ScoreSummaryResponse.ScoreDetail.builder()
                                    .criteriaId(d.getCriteria().getId())
                                    .score(d.getScore())
                                    .build())
                            .collect(Collectors.toList());

                    return ScoreSummaryResponse.MemberScore.builder()
                            .lecturerId(g.getLecturer().getId())
                            .lecturerName(g.getLecturer().getFullName())
                            .councilRole(councilRole)
                            .total(g.getTotalScore())
                            .details(details)
                            .build();
                })
                .collect(Collectors.toList());

        return ScoreSummaryResponse.builder()
                .thesisId(thesis.getId())
                .thesisTitle(thesis.getTitle())
                .avgScore(thesis.getAverageScore())
                .classification(thesis.getGradeClassification())
                .criteria(criteriaInfos)
                .memberScores(memberScores)
                .build();
    }

    @Override
    @Transactional
    public GradeResponse saveScore(Long lecturerId, ScoreSaveRequest request) {
        // Find which council this thesis belongs to
        List<CouncilThesis> cts = councilThesisRepository.findByThesisId(request.getThesisId());
        if (cts.isEmpty()) {
            throw new BusinessException("Khóa luận chưa được phân công cho hội đồng nào");
        }
        Long councilId = cts.get(0).getCouncil().getId();

        validateGradingContext(councilId, request.getThesisId(), lecturerId);

        Grade grade = getOrCreateGrade(councilId, request.getThesisId(), lecturerId);
        grade.setDraft(false);
        grade.setConfirmed(false);

        if (request.getDetails() != null) {
            List<GradeRequest.GradeItem> items = request.getDetails().stream()
                    .map(d -> {
                        GradeRequest.GradeItem item = new GradeRequest.GradeItem();
                        item.setCriteriaId(d.getCriteriaId());
                        item.setScore(d.getScore());
                        return item;
                    })
                    .collect(Collectors.toList());
            double totalScore = buildGradeDetails(grade, items);
            grade.setTotalScore(totalScore);
        }

        gradeRepository.save(grade);
        updateThesisStatusToGrading(request.getThesisId());
        return gradeMapper.toResponse(grade);
    }

    @Override
    @Transactional
    public GradeResponse updateScore(Long gradeId, Long lecturerId, ScoreSaveRequest request) {
        Grade grade = gradeRepository.findById(gradeId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy điểm ID: " + gradeId));
        if (!grade.getLecturer().getId().equals(lecturerId)) {
            throw new BusinessException("Bạn không có quyền chỉnh sửa điểm này");
        }
        if (grade.getCouncil().getStatus() == CouncilStatus.LOCKED) {
            throw new BusinessException("Hội đồng đã bị khóa");
        }

        gradeDetailRepository.deleteAll(grade.getDetails());
        grade.getDetails().clear();

        if (request.getDetails() != null) {
            List<GradeRequest.GradeItem> items = request.getDetails().stream()
                    .map(d -> {
                        GradeRequest.GradeItem item = new GradeRequest.GradeItem();
                        item.setCriteriaId(d.getCriteriaId());
                        item.setScore(d.getScore());
                        return item;
                    })
                    .collect(Collectors.toList());
            double totalScore = buildGradeDetails(grade, items);
            grade.setTotalScore(totalScore);
        }

        gradeRepository.save(grade);
        return gradeMapper.toResponse(grade);
    }

    // ==================== Original endpoints ====================

    @Override
    @Transactional(readOnly = true)
    public List<AssignedThesisResponse> getAssignedTheses(Long lecturerId) {
        List<CouncilMember> memberships = councilMemberRepository.findByUserId(lecturerId);
        List<AssignedThesisResponse> result = new ArrayList<>();

        for (CouncilMember membership : memberships) {
            Council council = membership.getCouncil();
            List<CouncilThesis> councilTheses = councilThesisRepository.findByCouncilId(council.getId());

            List<AssignedThesisResponse.ThesisItem> thesisItems = councilTheses.stream()
                    .map(ct -> {
                        Optional<Grade> grade = gradeRepository.findByCouncilIdAndThesisIdAndLecturerId(
                                council.getId(), ct.getThesis().getId(), lecturerId);
                        return AssignedThesisResponse.ThesisItem.builder()
                                .thesisId(ct.getThesis().getId())
                                .title(ct.getThesis().getTitle())
                                .status(ct.getThesis().getStatus().name())
                                .hasGraded(grade.isPresent())
                                .confirmed(grade.map(Grade::isConfirmed).orElse(false))
                                .build();
                    })
                    .collect(Collectors.toList());

            result.add(AssignedThesisResponse.builder()
                    .councilId(council.getId())
                    .councilName(council.getName())
                    .councilStatus(council.getStatus().name())
                    .theses(thesisItems)
                    .build());
        }
        return result;
    }

    @Override
    @Transactional
    public GradeResponse submitGrade(Long lecturerId, GradeRequest request) {
        validateGradingContext(request.getCouncilId(), request.getThesisId(), lecturerId);

        List<Criteria> criteriaList = criteriaRepository.findByCouncilId(request.getCouncilId());
        if (request.getGrades() == null || request.getGrades().size() != criteriaList.size()) {
            throw new BusinessException("Phải chấm điểm cho tất cả " + criteriaList.size() + " tiêu chí");
        }

        Grade grade = getOrCreateGrade(request.getCouncilId(), request.getThesisId(), lecturerId);
        grade.setDraft(false);
        grade.setConfirmed(false);

        double totalScore = buildGradeDetails(grade, request.getGrades());
        grade.setTotalScore(totalScore);
        gradeRepository.save(grade);

        updateThesisStatusToGrading(request.getThesisId());
        return gradeMapper.toResponse(grade);
    }

    @Override
    @Transactional
    public GradeResponse saveDraft(Long lecturerId, GradeRequest request) {
        validateGradingContext(request.getCouncilId(), request.getThesisId(), lecturerId);

        Grade grade = getOrCreateGrade(request.getCouncilId(), request.getThesisId(), lecturerId);
        grade.setDraft(true);
        grade.setConfirmed(false);

        gradeDetailRepository.deleteAll(grade.getDetails());
        grade.getDetails().clear();

        if (request.getGrades() != null) {
            for (GradeRequest.GradeItem item : request.getGrades()) {
                if (item.getCriteriaId() != null && item.getScore() != null) {
                    Criteria criteria = criteriaRepository.findById(item.getCriteriaId())
                            .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy tiêu chí"));
                    grade.getDetails().add(GradeDetail.builder()
                            .grade(grade).criteria(criteria).score(item.getScore()).build());
                }
            }
        }
        gradeRepository.save(grade);
        return gradeMapper.toResponse(grade);
    }

    @Override
    @Transactional
    public GradeResponse confirmGrade(Long gradeId, Long lecturerId) {
        Grade grade = gradeRepository.findById(gradeId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy điểm ID: " + gradeId));

        if (!grade.getLecturer().getId().equals(lecturerId)) {
            throw new BusinessException("Bạn không có quyền xác nhận điểm này");
        }
        if (grade.getCouncil().getStatus() == CouncilStatus.LOCKED) {
            throw new BusinessException("Hội đồng đã bị khóa, không thể thay đổi điểm");
        }

        List<Criteria> criteriaList = criteriaRepository.findByCouncilId(grade.getCouncil().getId());
        if (grade.getDetails().size() != criteriaList.size()) {
            throw new BusinessException("Phải chấm điểm cho tất cả tiêu chí trước khi xác nhận");
        }

        double totalScore = grade.getDetails().stream()
                .mapToDouble(d -> d.getScore() * d.getCriteria().getWeightPercent() / 100.0)
                .sum();
        grade.setTotalScore(Math.round(totalScore * 10.0) / 10.0);
        grade.setDraft(false);
        grade.setConfirmed(true);
        gradeRepository.save(grade);

        return gradeMapper.toResponse(grade);
    }

    @Override
    @Transactional(readOnly = true)
    public CouncilGradeResponse getCouncilGrades(Long councilId) {
        Council council = councilRepository.findById(councilId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy hội đồng ID: " + councilId));

        List<CouncilThesis> councilTheses = councilThesisRepository.findByCouncilId(councilId);
        List<Grade> allGrades = gradeRepository.findByCouncilId(councilId);

        List<CouncilGradeResponse.ThesisGrade> thesisGrades = councilTheses.stream()
                .map(ct -> {
                    Thesis thesis = ct.getThesis();
                    List<CouncilGradeResponse.LecturerGrade> lecturerGrades = allGrades.stream()
                            .filter(g -> g.getThesis().getId().equals(thesis.getId()))
                            .map(g -> CouncilGradeResponse.LecturerGrade.builder()
                                    .lecturerId(g.getLecturer().getId())
                                    .lecturerName(g.getLecturer().getFullName())
                                    .totalScore(g.getTotalScore())
                                    .confirmed(g.isConfirmed())
                                    .build())
                            .collect(Collectors.toList());

                    return CouncilGradeResponse.ThesisGrade.builder()
                            .thesisId(thesis.getId())
                            .thesisTitle(thesis.getTitle())
                            .averageScore(thesis.getAverageScore())
                            .classification(thesis.getGradeClassification())
                            .lecturerGrades(lecturerGrades)
                            .build();
                })
                .collect(Collectors.toList());

        return CouncilGradeResponse.builder()
                .councilId(councilId)
                .councilName(council.getName())
                .thesisGrades(thesisGrades)
                .build();
    }

    // ==================== Private Helpers ====================

    private void validateGradingContext(Long councilId, Long thesisId, Long lecturerId) {
        Council council = councilRepository.findById(councilId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy hội đồng ID: " + councilId));
        if (council.getStatus() == CouncilStatus.LOCKED) {
            throw new BusinessException("Hội đồng đã bị khóa, không thể chấm điểm");
        }
        if (council.getStatus() != CouncilStatus.ACTIVE) {
            throw new BusinessException("Hội đồng chưa ở trạng thái ACTIVE để chấm điểm");
        }
        if (!councilMemberRepository.existsByCouncilIdAndUserId(councilId, lecturerId)) {
            throw new BusinessException("Bạn không phải thành viên của hội đồng này");
        }
        if (!councilThesisRepository.existsByCouncilIdAndThesisId(councilId, thesisId)) {
            throw new BusinessException("Khóa luận không thuộc hội đồng này");
        }
    }

    private Grade getOrCreateGrade(Long councilId, Long thesisId, Long lecturerId) {
        Optional<Grade> existing = gradeRepository.findByCouncilIdAndThesisIdAndLecturerId(
                councilId, thesisId, lecturerId);

        if (existing.isPresent()) {
            Grade grade = existing.get();
            if (grade.isConfirmed()) {
                throw new BusinessException("Điểm đã được xác nhận, không thể chỉnh sửa");
            }
            gradeDetailRepository.deleteAll(grade.getDetails());
            grade.getDetails().clear();
            return grade;
        }

        return Grade.builder()
                .council(councilRepository.findById(councilId).orElseThrow())
                .thesis(thesisRepository.findById(thesisId).orElseThrow())
                .lecturer(userRepository.findById(lecturerId)
                        .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy giảng viên")))
                .build();
    }

    private double buildGradeDetails(Grade grade, List<GradeRequest.GradeItem> items) {
        double totalScore = 0;
        for (GradeRequest.GradeItem item : items) {
            Criteria criteria = criteriaRepository.findById(item.getCriteriaId())
                    .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy tiêu chí ID: " + item.getCriteriaId()));
            grade.getDetails().add(GradeDetail.builder()
                    .grade(grade).criteria(criteria).score(item.getScore()).build());
            totalScore += item.getScore() * criteria.getWeightPercent() / 100.0;
        }
        return Math.round(totalScore * 10.0) / 10.0;
    }

    private void updateThesisStatusToGrading(Long thesisId) {
        Thesis thesis = thesisRepository.findById(thesisId).orElseThrow();
        if (thesis.getStatus() == ThesisStatus.ASSIGNED_COUNCIL) {
            thesis.setStatus(ThesisStatus.GRADING);
            thesisRepository.save(thesis);
        }
    }
}
