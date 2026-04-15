package com.university.thesis.controller;

import com.university.thesis.dto.request.AssignReviewerRequest;
import com.university.thesis.dto.request.CreateThesisRequest;
import com.university.thesis.dto.request.UpdateThesisRequest;
import com.university.thesis.dto.response.ThesisResponse;
import com.university.thesis.service.ThesisService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/thesis")
@RequiredArgsConstructor
public class ThesisController {

    private final ThesisService thesisService;

    @PostMapping
    public ResponseEntity<ThesisResponse> createThesis(
            @Valid @RequestBody CreateThesisRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(thesisService.createThesis(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ThesisResponse> updateThesis(
            @PathVariable Long id,
            @Valid @RequestBody UpdateThesisRequest request) {
        return ResponseEntity.ok(thesisService.updateThesis(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteThesis(@PathVariable Long id) {
        thesisService.deleteThesis(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping
    public ResponseEntity<List<ThesisResponse>> getAllTheses() {
        return ResponseEntity.ok(thesisService.getAllTheses());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ThesisResponse> getThesisById(@PathVariable Long id) {
        return ResponseEntity.ok(thesisService.getThesisById(id));
    }

    @GetMapping("/search")
    public ResponseEntity<List<ThesisResponse>> searchTheses(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String year,
            @RequestParam(required = false) String major) {
        return ResponseEntity.ok(thesisService.searchTheses(keyword, year, major));
    }

    @PutMapping("/{id}/assign-reviewer")
    public ResponseEntity<ThesisResponse> assignReviewer(
            @PathVariable Long id,
            @Valid @RequestBody AssignReviewerRequest request) {
        return ResponseEntity.ok(thesisService.assignReviewer(id, request));
    }

    @GetMapping("/student/{studentId}")
    public ResponseEntity<List<ThesisResponse>> getByStudent(@PathVariable Long studentId) {
        return ResponseEntity.ok(thesisService.getByStudent(studentId));
    }

    @GetMapping("/lecturer/{lecturerId}")
    public ResponseEntity<List<ThesisResponse>> getByLecturer(@PathVariable Long lecturerId) {
        return ResponseEntity.ok(thesisService.getByLecturer(lecturerId));
    }
}
