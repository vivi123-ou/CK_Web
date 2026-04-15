package com.university.thesis.service.impl;

import com.university.thesis.config.JwtTokenProvider;
import com.university.thesis.dto.request.LoginRequest;
import com.university.thesis.dto.response.JwtResponse;
import com.university.thesis.entity.User;
import com.university.thesis.entity.UserStatus;
import com.university.thesis.exception.AccountLockedException;
import com.university.thesis.exception.BusinessException;
import com.university.thesis.mapper.UserMapper;
import com.university.thesis.repository.UserRepository;
import com.university.thesis.service.AuthService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final UserMapper userMapper;

    private static final int MAX_FAILED_ATTEMPTS = 5;
    private static final int LOCK_DURATION_MINUTES = 15;

    @Override
    @Transactional
    public JwtResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new BusinessException("Email hoặc mật khẩu không chính xác"));

        // Check if account is locked
        if (user.getStatus() == UserStatus.LOCKED_TEMP) {
            if (user.getLockTime() != null &&
                user.getLockTime().plusMinutes(LOCK_DURATION_MINUTES).isAfter(LocalDateTime.now())) {
                throw new AccountLockedException(
                    "Tài khoản đã bị khóa tạm thời. Vui lòng thử lại sau " + LOCK_DURATION_MINUTES + " phút");
            }
            user.setStatus(UserStatus.ACTIVE);
            user.setFailedLoginAttempts(0);
            user.setLockTime(null);
            userRepository.save(user);
        }

        if (user.getStatus() == UserStatus.DISABLED) {
            throw new BusinessException("Tài khoản đã bị vô hiệu hóa");
        }

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            handleFailedLogin(user);
            throw new BusinessException("Email hoặc mật khẩu không chính xác");
        }

        // Reset on success
        user.setFailedLoginAttempts(0);
        user.setLockTime(null);
        userRepository.save(user);

        String token = jwtTokenProvider.generateToken(user.getId(), user.getEmail(), user.getRole().name());
        return userMapper.toJwtResponse(user, token);
    }

    private void handleFailedLogin(User user) {
        int attempts = user.getFailedLoginAttempts() + 1;
        user.setFailedLoginAttempts(attempts);
        if (attempts >= MAX_FAILED_ATTEMPTS) {
            user.setStatus(UserStatus.LOCKED_TEMP);
            user.setLockTime(LocalDateTime.now());
            log.warn("Account locked for user: {} after {} failed attempts", user.getEmail(), attempts);
        }
        userRepository.save(user);
    }
}
