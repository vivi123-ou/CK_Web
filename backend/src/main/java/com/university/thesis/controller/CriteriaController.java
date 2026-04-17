package com.university.thesis.controller;

import com.university.thesis.dto.request.CreateCriteriaRequest;
import com.university.thesis.dto.response.CriteriaResponse;
import com.university.thesis.service.CriteriaService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/criteria")
@RequiredArgsConstructor
public class CriteriaController {

    private final CriteriaService criteriaService;

    @GetMapping
    public ResponseEntity<List<CriteriaResponse>> getAll() {
        return ResponseEntity.ok(criteriaService.getAll());
    }

    @PostMapping
    public ResponseEntity<CriteriaResponse> create(
            @Valid @RequestBody CreateCriteriaRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(criteriaService.create(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<CriteriaResponse> update(
            @PathVariable Long id,
            @Valid @RequestBody CreateCriteriaRequest request) {
        return ResponseEntity.ok(criteriaService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        criteriaService.delete(id);
        return ResponseEntity.ok().build();
    }
}
