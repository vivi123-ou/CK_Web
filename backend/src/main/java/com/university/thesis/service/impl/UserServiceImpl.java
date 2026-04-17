package com.university.thesis.service.impl;

import com.university.thesis.dto.request.*;
import com.university.thesis.dto.response.UserProfileResponse;
import com.university.thesis.dto.response.UserResponse;
import com.university.thesis.entity.Role;
import com.university.thesis.entity.User;
import com.university.thesis.entity.UserStatus;
import com.university.thesis.exception.BusinessException;
import com.university.thesis.exception.ResourceNotFoundException;
import com.university.thesis.mapper.UserMapper;
import com.university.thesis.repository.*;
import com.university.thesis.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final UserMapper userMapper;
    private final CouncilMemberRepository councilMemberRepository;
    private final GradeRepository gradeRepository;
    private final ThesisLecturerRepository thesisLecturerRepository;
    private final ThesisStudentRepository thesisStudentRepository;

    @Override
    public UserProfileResponse getProfile(Long userId) {
        return userMapper.toProfileResponse(findUserById(userId));
    }

    @Override
    @Transactional
    public UserProfileResponse updateProfile(Long userId, UpdateProfileRequest request) {
        User user = findUserById(userId);
        user.setFullName(request.getFullName());
        if (request.getPhone() != null) {
            user.setPhone(request.getPhone());
        }
        userRepository.save(user);
        return userMapper.toProfileResponse(user);
    }

    @Override
    @Transactional
    public void changePassword(Long userId, ChangePasswordRequest request) {
        User user = findUserById(userId);
        if (!passwordEncoder.matches(request.getOldPassword(), user.getPassword())) {
            throw new BusinessException("Mật khẩu cũ không chính xác");
        }
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }

    @Override
    public List<UserResponse> getAllUsers(String role) {
        List<User> users;
        if (role != null && !role.isBlank()) {
            Role r = parseRole(role);
            users = userRepository.findByRole(r);
        } else {
            users = userRepository.findAll();
        }
        return users.stream()
                .filter(u -> u.getStatus() != UserStatus.DISABLED) // Chỉ lấy người dùng chưa bị xóa
                .map(userMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public UserResponse getUserById(Long userId) {
        return userMapper.toResponse(findUserById(userId));
    }

    @Override
    @Transactional
    public UserResponse createUser(CreateUserRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BusinessException("Email đã tồn tại trong hệ thống");
        }
        Role role = parseRole(request.getRole());

        User user = User.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getName())
                .phone(request.getPhone())
                .role(role)
                .status(UserStatus.ACTIVE)
                .build();
        userRepository.save(user);
        return userMapper.toResponse(user);
    }

    @Override
    @Transactional
    public UserResponse updateUser(Long userId, UpdateUserRequest request) {
        User user = findUserById(userId);
        if (request.getEmail() != null && !request.getEmail().equals(user.getEmail())) {
            if (userRepository.existsByEmail(request.getEmail())) {
                throw new BusinessException("Email đã tồn tại trong hệ thống");
            }
            user.setEmail(request.getEmail());
        }
        if (request.getName() != null) {
            user.setFullName(request.getName());
        }
        if (request.getPhone() != null) {
            user.setPhone(request.getPhone());
        }
        if (request.getRole() != null) {
            Role newRole = parseRole(request.getRole());
            if (newRole != user.getRole()) {
                assertNoBusinessData(user);
            }
            user.setRole(newRole);
        }
        if (request.getStatus() != null) {
            user.setStatus(parseStatus(request.getStatus()));
        }
        userRepository.save(user);
        return userMapper.toResponse(user);
    }

    @Override
    @Transactional
    public void deleteUser(Long userId) {
        User user = findUserById(userId);

        // Kiểm tra xem người dùng có đang liên quan đến khóa luận hay hội đồng nào không
        boolean hasBusinessData = !gradeRepository.findByLecturerId(user.getId()).isEmpty() ||
                !councilMemberRepository.findByUserId(user.getId()).isEmpty() ||
                !thesisLecturerRepository.findByLecturerId(user.getId()).isEmpty() ||
                !thesisStudentRepository.findByStudentId(user.getId()).isEmpty();

        if (hasBusinessData) {
            throw new BusinessException("Không thể xóa hoàn toàn vì người dùng đã có dữ liệu nghiệp vụ. Hệ thống sẽ chuyển trạng thái sang TẠM KHÓA.");
        }

        // Thực hiện Xóa mềm (Soft Delete) để tránh lỗi Database Integrity
        user.setStatus(UserStatus.DISABLED);
        user.setEmail(user.getEmail() + "_del_" + System.currentTimeMillis());
        user.setPhone(null);
        user.setPassword(passwordEncoder.encode("DELETED_" + System.currentTimeMillis()));
        userRepository.save(user);
    }

    @Override
    @Transactional
    public UserResponse assignRole(Long userId, AssignRoleRequest request) {
        User user = findUserById(userId);
        Role newRole = parseRole(request.getRole());
        if (newRole != user.getRole()) {
            assertNoBusinessData(user);
        }
        user.setRole(newRole);
        userRepository.save(user);
        return userMapper.toResponse(user);
    }

    @Override
    @Transactional
    public void resetPassword(Long userId) {
        User user = findUserById(userId);
        user.setPassword(passwordEncoder.encode("123456"));
        user.setFailedLoginAttempts(0);
        user.setStatus(UserStatus.ACTIVE);
        user.setLockTime(null);
        userRepository.save(user);
    }

    // ==================== Private Helpers ====================

    private User findUserById(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng với ID: " + userId));
    }

    private Role parseRole(String roleName) {
        if (roleName == null)
            throw new BusinessException("Vai trò không được để trống");
        String upper = roleName.toUpperCase().trim();
        try {
            return Role.valueOf(upper);
        } catch (IllegalArgumentException ignored) {}

        switch (upper) {
            case "GIAOVU": return Role.GIAO_VU;
            case "GIANGVIEN": return Role.GIANG_VIEN;
            case "SINHVIEN": return Role.SINH_VIEN;
            default: throw new BusinessException("Vai trò không hợp lệ: " + roleName);
        }
    }

    private UserStatus parseStatus(String statusName) {
        try {
            return UserStatus.valueOf(statusName.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new BusinessException("Trạng thái không hợp lệ: " + statusName);
        }
    }

    private void assertNoBusinessData(User user) {
        if (!gradeRepository.findByLecturerId(user.getId()).isEmpty() ||
                !councilMemberRepository.findByUserId(user.getId()).isEmpty() ||
                !thesisLecturerRepository.findByLecturerId(user.getId()).isEmpty() ||
                !thesisStudentRepository.findByStudentId(user.getId()).isEmpty()) {
            throw new BusinessException("Không thể thay đổi vai trò vì người dùng đã có dữ liệu trong hệ thống (Khóa luận/Hội đồng)");
        }
    }
}