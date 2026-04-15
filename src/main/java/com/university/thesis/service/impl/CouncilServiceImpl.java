package com.university.thesis.service.impl;

import com.university.thesis.dto.request.*;
import com.university.thesis.dto.response.CouncilDetailResponse;
import com.university.thesis.entity.*;
import com.university.thesis.exception.BusinessException;
import com.university.thesis.exception.ResourceNotFoundException;
import com.university.thesis.mapper.CouncilMapper;
import com.university.thesis.repository.*;
import com.university.thesis.service.CouncilService;
import com.university.thesis.service.EmailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class CouncilServiceImpl implements CouncilService {

    private final CouncilRepository councilRepository;
    private final CouncilMemberRepository councilMemberRepository;
    private final CouncilThesisRepository councilThesisRepository;
    private final CriteriaRepository criteriaRepository;
    private final UserRepository userRepository;
    private final ThesisRepository thesisRepository;
    private final GradeRepository gradeRepository;
    private final ThesisStudentRepository thesisStudentRepository;
    private final EmailService emailService;
    private final CouncilMapper councilMapper;

    @Override
    @Transactional(readOnly = true)
    public List<CouncilDetailResponse> getAllCouncils() {
        return councilRepository.findAll().stream()
                .map(this::buildDetailResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public CouncilDetailResponse createCouncil(CreateCouncilRequest request) {
        Council council = Council.builder()
                .name(request.getName())
                .defenseDate(parseDate(request.getDate()))
                .location(request.getRoom())
                .status(CouncilStatus.DRAFT)
                .build();
        councilRepository.save(council);

        // Add members if provided
        if (request.getMembers() != null) {
            for (CreateCouncilRequest.MemberItem m : request.getMembers()) {
                User user = userRepository.findById(m.getLecturerId())
                        .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy giảng viên ID: " + m.getLecturerId()));
                CouncilMemberRole role = parseMemberRole(m.getCouncilRole());
                councilMemberRepository.save(CouncilMember.builder()
                        .council(council).user(user).memberRole(role).build());
            }
        }

        // Assign theses if provided
        if (request.getThesisIds() != null) {
            for (Long thesisId : request.getThesisIds()) {
                Thesis thesis = thesisRepository.findById(thesisId)
                        .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy khóa luận ID: " + thesisId));
                councilThesisRepository.save(CouncilThesis.builder().council(council).thesis(thesis).build());
                thesis.setStatus(ThesisStatus.ASSIGNED_COUNCIL);
                thesisRepository.save(thesis);
            }
        }

        checkAndActivateCouncil(council);
        return buildDetailResponse(council);
    }

    @Override
    @Transactional
    public CouncilDetailResponse updateCouncil(Long councilId, CreateCouncilRequest request) {
        Council council = findCouncilById(councilId);
        assertModifiable(council);

        if (request.getName() != null) council.setName(request.getName());
        if (request.getDate() != null) council.setDefenseDate(parseDate(request.getDate()));
        if (request.getRoom() != null) council.setLocation(request.getRoom());

        councilRepository.save(council);
        return buildDetailResponse(council);
    }

    @Override
    @Transactional
    public void deleteCouncil(Long councilId) {
        Council council = findCouncilById(councilId);
        assertModifiable(council);
        councilRepository.delete(council);
    }

    @Override
    @Transactional
    public CouncilDetailResponse addMember(Long councilId, AddCouncilMemberRequest request) {
        Council council = findCouncilById(councilId);
        assertModifiable(council);

        if (councilMemberRepository.countByCouncilId(councilId) >= 5) {
            throw new BusinessException("Hội đồng đã đạt tối đa 5 thành viên");
        }

        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng ID: " + request.getUserId()));
        if (user.getRole() != Role.GIANG_VIEN) {
            throw new BusinessException("Chỉ giảng viên mới có thể là thành viên hội đồng");
        }
        if (councilMemberRepository.existsByCouncilIdAndUserId(councilId, request.getUserId())) {
            throw new BusinessException("Người dùng đã là thành viên của hội đồng này");
        }

        CouncilMemberRole memberRole = parseMemberRole(request.getMemberRole());

        // CHU_TICH and THU_KY must be unique per council
        if (memberRole == CouncilMemberRole.CHU_TICH || memberRole == CouncilMemberRole.THU_KY) {
            if (!councilMemberRepository.findByCouncilIdAndMemberRole(councilId, memberRole).isEmpty()) {
                throw new BusinessException("Hội đồng đã có " + memberRole.name());
            }
        }

        councilMemberRepository.save(CouncilMember.builder()
                .council(council).user(user).memberRole(memberRole).build());

        checkAndActivateCouncil(council);
        return buildDetailResponse(council);
    }

    @Override
    @Transactional
    public CouncilDetailResponse removeMember(Long councilId, Long userId) {
        Council council = findCouncilById(councilId);
        assertModifiable(council);

        CouncilMember member = councilMemberRepository.findByCouncilIdAndUserId(councilId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy thành viên trong hội đồng"));
        councilMemberRepository.delete(member);

        if (council.getStatus() == CouncilStatus.ACTIVE) {
            council.setStatus(CouncilStatus.DRAFT);
            councilRepository.save(council);
        }
        return buildDetailResponse(council);
    }

    @Override
    @Transactional
    public CouncilDetailResponse assignTheses(Long councilId, AssignCouncilThesisRequest request) {
        Council council = findCouncilById(councilId);
        assertModifiable(council);

        int currentCount = councilThesisRepository.countByCouncilId(councilId);
        if (currentCount + request.getThesisIds().size() > 5) {
            throw new BusinessException("Hội đồng chỉ được phân công tối đa 5 khóa luận");
        }

        for (Long thesisId : request.getThesisIds()) {
            Thesis thesis = thesisRepository.findById(thesisId)
                    .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy khóa luận ID: " + thesisId));
            if (councilThesisRepository.existsByCouncilIdAndThesisId(councilId, thesisId)) {
                throw new BusinessException("Khóa luận '" + thesis.getTitle() + "' đã được phân công cho hội đồng này");
            }

            councilThesisRepository.save(CouncilThesis.builder().council(council).thesis(thesis).build());
            thesis.setStatus(ThesisStatus.ASSIGNED_COUNCIL);
            thesisRepository.save(thesis);
        }
        return buildDetailResponse(council);
    }

    @Override
    @Transactional
    public CouncilDetailResponse setCriteria(Long councilId, SetCriteriaRequest request) {
        Council council = findCouncilById(councilId);
        assertModifiable(council);

        int totalWeight = request.getCriteria().stream()
                .mapToInt(SetCriteriaRequest.CriteriaItem::getWeightPercent).sum();
        if (totalWeight != 100) {
            throw new BusinessException("Tổng trọng số phải bằng 100%. Hiện tại: " + totalWeight + "%");
        }

        criteriaRepository.deleteByCouncilId(councilId);
        for (SetCriteriaRequest.CriteriaItem item : request.getCriteria()) {
            criteriaRepository.save(Criteria.builder()
                    .council(council).name(item.getName()).weightPercent(item.getWeightPercent()).build());
        }

        checkAndActivateCouncil(council);
        return buildDetailResponse(council);
    }

    @Override
    @Transactional(readOnly = true)
    public CouncilDetailResponse getCouncilDetail(Long councilId) {
        return buildDetailResponse(findCouncilById(councilId));
    }

    @Override
    @Transactional
    public CouncilDetailResponse lockCouncil(Long councilId) {
        Council council = findCouncilById(councilId);
        if (council.getStatus() != CouncilStatus.ACTIVE) {
            throw new BusinessException("Chỉ có thể khóa hội đồng ở trạng thái ACTIVE");
        }

        List<CouncilThesis> councilTheses = councilThesisRepository.findByCouncilId(councilId);
        List<CouncilMember> members = councilMemberRepository.findByCouncilId(councilId);

        // Validate all grades confirmed
        for (CouncilThesis ct : councilTheses) {
            for (CouncilMember member : members) {
                var grade = gradeRepository.findByCouncilIdAndThesisIdAndLecturerId(
                        councilId, ct.getThesis().getId(), member.getUser().getId());
                if (grade.isEmpty()) {
                    throw new BusinessException("Giảng viên " + member.getUser().getFullName() +
                            " chưa chấm điểm cho khóa luận '" + ct.getThesis().getTitle() + "'");
                }
                if (!grade.get().isConfirmed()) {
                    throw new BusinessException("Giảng viên " + member.getUser().getFullName() +
                            " chưa xác nhận điểm cho khóa luận '" + ct.getThesis().getTitle() + "'");
                }
            }
        }

        council.setStatus(CouncilStatus.LOCKED);
        councilRepository.save(council);

        // UC-030: Calculate average scores + UC-034: Send email
        for (CouncilThesis ct : councilTheses) {
            Thesis thesis = ct.getThesis();
            Double avgScore = gradeRepository.calculateAverageScoreByThesisId(thesis.getId());
            if (avgScore != null) {
                avgScore = Math.round(avgScore * 10.0) / 10.0;
                thesis.setAverageScore(avgScore);
                thesis.setGradeClassification(classifyGrade(avgScore));
                thesis.setStatus(ThesisStatus.COMPLETED);
                thesisRepository.save(thesis);

                try {
                    for (ThesisStudent ts : thesisStudentRepository.findByThesisId(thesis.getId())) {
                        emailService.sendGradeNotificationEmail(
                                ts.getStudent().getEmail(), thesis.getTitle(),
                                avgScore, thesis.getGradeClassification());
                    }
                } catch (Exception e) {
                    log.error("Lỗi gửi email thông báo điểm: {}", e.getMessage());
                }
            }
        }
        return buildDetailResponse(council);
    }

    @Override
    @Transactional
    public CouncilDetailResponse unlockCouncil(Long councilId) {
        Council council = findCouncilById(councilId);
        if (council.getStatus() != CouncilStatus.LOCKED) {
            throw new BusinessException("Chỉ có thể mở khóa hội đồng ở trạng thái LOCKED");
        }

        council.setStatus(CouncilStatus.ACTIVE);
        councilRepository.save(council);

        councilThesisRepository.findByCouncilId(councilId).forEach(ct -> {
            Thesis thesis = ct.getThesis();
            if (thesis.getStatus() == ThesisStatus.COMPLETED) {
                thesis.setStatus(ThesisStatus.GRADING);
                thesis.setAverageScore(null);
                thesis.setGradeClassification(null);
                thesisRepository.save(thesis);
            }
        });
        return buildDetailResponse(council);
    }

    // ==================== Private Helpers ====================

    private Council findCouncilById(Long councilId) {
        return councilRepository.findById(councilId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy hội đồng ID: " + councilId));
    }

    private void assertModifiable(Council council) {
        if (council.getStatus() == CouncilStatus.LOCKED || council.getStatus() == CouncilStatus.ARCHIVED) {
            throw new BusinessException("Không thể thay đổi hội đồng ở trạng thái " + council.getStatus());
        }
    }

    private CouncilMemberRole parseMemberRole(String roleName) {
        try {
            return CouncilMemberRole.valueOf(roleName.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new BusinessException("Vai trò thành viên không hợp lệ: " + roleName);
        }
    }

    private LocalDate parseDate(String dateStr) {
        if (dateStr == null || dateStr.isBlank()) return null;
        try {
            return LocalDate.parse(dateStr);
        } catch (Exception e) {
            return null;
        }
    }

    private String classifyGrade(double score) {
        if (score > 9.0) return "Xuất sắc";
        if (score >= 8.0) return "Giỏi";
        if (score >= 7.0) return "Khá";
        if (score >= 5.5) return "Trung bình";
        return "Yếu";
    }

    private void checkAndActivateCouncil(Council council) {
        Long id = council.getId();
        int memberCount = councilMemberRepository.countByCouncilId(id);
        boolean hasChuTich = !councilMemberRepository.findByCouncilIdAndMemberRole(id, CouncilMemberRole.CHU_TICH).isEmpty();
        boolean hasThuKy = !councilMemberRepository.findByCouncilIdAndMemberRole(id, CouncilMemberRole.THU_KY).isEmpty();
        boolean hasPhanBien = !councilMemberRepository.findByCouncilIdAndMemberRole(id, CouncilMemberRole.PHAN_BIEN).isEmpty();
        int criteriaWeight = criteriaRepository.sumWeightByCouncilId(id);

        if (memberCount >= 3 && hasChuTich && hasThuKy && hasPhanBien && criteriaWeight == 100
                && council.getStatus() == CouncilStatus.DRAFT) {
            council.setStatus(CouncilStatus.ACTIVE);
            councilRepository.save(council);
        }
    }

    private CouncilDetailResponse buildDetailResponse(Council council) {
        return councilMapper.toDetailResponse(council,
                councilMemberRepository.findByCouncilId(council.getId()),
                councilThesisRepository.findByCouncilId(council.getId()),
                criteriaRepository.findByCouncilId(council.getId()));
    }
}
