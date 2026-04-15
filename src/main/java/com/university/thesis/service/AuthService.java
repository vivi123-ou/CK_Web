package com.university.thesis.service;

import com.university.thesis.dto.request.LoginRequest;
import com.university.thesis.dto.response.JwtResponse;

public interface AuthService {

    JwtResponse login(LoginRequest request);
}
