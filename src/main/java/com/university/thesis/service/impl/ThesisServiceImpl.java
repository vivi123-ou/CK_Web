package com.university.thesis.service.impl;

import com.university.thesis.dto.request.*;
import com.university.thesis.dto.response.ThesisResponse;
import com.university.thesis.entity.*;
import com.university.thesis.exception.BusinessException;
import com.university.thesis.exception.ResourceNotFoundException;
import com.university.thesis.mapper.ThesisMapper;
import com.university.thesis.repository.*;
import com.university.thesis.service.EmailService;
import com.university.thesis.service.ThesisService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ThesisServiceImpl implements ThesisService {

    private final ThesisRepository thesisRepository;
    private final ThesisStudentRepository thesisStudentRepository;
    private final ThesisLecturerRepository thesisLecturerRepository;
    private final UserRepository userRepository;
    private final CouncilThesisRepository councilThesisRepository;
    private final EmailService emailService;
    private final ThesisMapper thesisMapper;

    @Override
    @Transactional
    public ThesisResponse createThesis(CreateThesisRequest request) {
        String academicYear = request.getYear() != null ? String.valueOf(request.getYear()) : "";
        List<User> students = validateStudents(request.getStudentIds(), academicYear);
        List<User> lecturers = validateLecturers(request.getAdvisorIds());

        Thesis thesis = Thesis.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .academicYear(academicYear)
                .major(request.getMajor())
                .status(ThesisStatus.CREATED)
                .build();
        thesisRepository.save(thesis);

        students.forEach(student -> thesisStudentRepository.save(
                ThesisStudent.builder().thesis(thesis).student(student).build()));
        lecturers.forEach(lecturer -> thesisLecturerRepository.save(
                ThesisLecturer.builder().thesis(thesis).lecturer(lecturer).build()));

        return buildThesisResponse(thesis);
    }

    @Override
    @Transactional
    public ThesisResponse updateThesis(Long thesisId, UpdateThesisRequest request) {
        Thesis thesis = findThesisById(thesisId);
        assertStatus(thesis, ThesisStatus.CREATED, "chỉnh sửa");

        if (request.getTitle() != null) thesis.setTitle(request.getTitle());
        if (request.getDescription() != null) thesis.setDescription(request.getDescription());
        if (request.getYear() != null) thesis.setAcademicYear(String.valueOf(request.getYear()));
        if (request.getMajor() != null) thesis.setMajor(request.getMajor());

        thesisRepository.save(thesis);
        return buildThesisResponse(thesis);
    }

    @Override
    @Transactional
    public void deleteThesis(Long thesisId) {
        Thesis thesis = findThesisById(thesisId);
        assertStatus(thesis, ThesisStatus.CREATED, "xóa");
        thesisRepository.delete(thesis);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ThesisResponse> getAllTheses() {
        return thesisRepository.findAll().stream()
                .map(this::buildThesisResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public ThesisResponse getThesisById(Long thesisId) {
        return buildThesisResponse(findThesisById(thesisId));
    }

    @Override
    @Transactional(readOnly = true)
    public List<ThesisResponse> searchTheses(String keyword, String year, String major) {
        return thesisRepository.searchTheses(keyword, year, major).stream()
                .map(this::buildThesisResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public ThesisResponse assignReviewer(Long thesisId, AssignReviewerRequest request) {
        Thesis thesis = findThesisById(thesisId);

        User reviewer = userRepository.findById(request.getLecturerId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Không tìm thấy giảng viên phản biện ID: " + request.getLecturerId()));

        if (reviewer.getRole() != Role.GIANG_VIEN) {
            throw new BusinessException("Người dùng này không phải giảng viên");
        }

        // Reviewer must NOT be a thesis supervisor
        boolean isConflict = thesisLecturerRepository.findByThesisId(thesisId).stream()
                .anyMatch(tl -> tl.getLecturer().getId().equals(request.getLecturerId()));
        if (isConflict) {
            throw new BusinessException("Giảng viên phản biện không được trùng với giảng viên hướng dẫn");
        }

        thesis.setReviewer(reviewer);
        thesis.setStatus(ThesisStatus.ASSIGNED_REVIEWER);
        thesisRepository.save(thesis);

        try {
            emailService.sendReviewerAssignmentEmail(reviewer.getEmail(), thesis.getTitle());
        } catch (Exception e) {
            log.error("Lỗi gửi email thông báo phản biện: {}", e.getMessage());
        }

        return buildThesisResponse(thesis);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ThesisResponse> getByStudent(Long studentId) {
        List<ThesisStudent> thesisStudents = thesisStudentRepository.findByStudentId(studentId);
        return thesisStudents.stream()
                .map(ts -> buildThesisResponse(ts.getThesis()))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ThesisResponse> getByLecturer(Long lecturerId) {
        // Get theses where lecturer is advisor
        List<ThesisLecturer> thesisLecturers = thesisLecturerRepository.findByLecturerId(lecturerId);
        List<Thesis> theses = thesisLecturers.stream()
                .map(ThesisLecturer::getThesis)
                .collect(Collectors.toList());

        // Also get theses where lecturer is reviewer
        List<Thesis> reviewerTheses = thesisRepository.findByReviewerId(lecturerId);
        for (Thesis t : reviewerTheses) {
            if (theses.stream().noneMatch(existing -> existing.getId().equals(t.getId()))) {
                theses.add(t);
            }
        }

        return theses.stream()
                .map(this::buildThesisResponse)
                .collect(Collectors.toList());
    }

    // ==================== Private Helpers ====================

    private Thesis findThesisById(Long thesisId) {
        return thesisRepository.findById(thesisId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy khóa luận ID: " + thesisId));
    }

    private void assertStatus(Thesis thesis, ThesisStatus expected, String action) {
        if (thesis.getStatus() != expected) {
            throw new BusinessException("Chỉ có thể " + action + " khóa luận ở trạng thái " + expected);
        }
    }

    private List<User> validateStudents(List<Long> studentIds, String academicYear) {
        return studentIds.stream()
                .map(id -> {
                    User user = userRepository.findById(id)
                            .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy sinh viên ID: " + id));
                    if (user.getRole() != Role.SINH_VIEN) {
                        throw new BusinessException("Người dùng " + user.getFullName() + " không phải sinh viên");
                    }
                    if (academicYear != null && !academicYear.isBlank() &&
                        !thesisStudentRepository.findByStudentIdAndAcademicYear(id, academicYear).isEmpty()) {
                        throw new BusinessException("Sinh viên " + user.getFullName() +
                                " đã tham gia khóa luận khác trong niên khóa " + academicYear);
                    }
                    return user;
                })
                .collect(Collectors.toList());
    }

    private List<User> validateLecturers(List<Long> lecturerIds) {
        return lecturerIds.stream()
                .map(id -> {
                    User user = userRepository.findById(id)
                            .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy giảng viên ID: " + id));
                    if (user.getRole() != Role.GIANG_VIEN) {
                        throw new BusinessException("Người dùng " + user.getFullName() + " không phải giảng viên");
                    }
                    return user;
                })
                .collect(Collectors.toList());
    }

    private ThesisResponse buildThesisResponse(Thesis thesis) {
        // Try to find council info for this thesis
        String councilName = null;
        String councilStatus = null;
        try {
            List<CouncilThesis> cts = councilThesisRepository.findByThesisId(thesis.getId());
            if (!cts.isEmpty()) {
                Council council = cts.get(0).getCouncil();
                councilName = council.getName();
                councilStatus = council.getStatus().name();
            }
        } catch (Exception e) {
            // Council info is optional
        }

        return thesisMapper.toResponse(thesis,
                thesisStudentRepository.findByThesisId(thesis.getId()),
                thesisLecturerRepository.findByThesisId(thesis.getId()),
                councilName,
                councilStatus);
    }
}
