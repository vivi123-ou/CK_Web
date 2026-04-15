package com.university.thesis.controller;

import com.university.thesis.dto.request.*;
import com.university.thesis.dto.response.CouncilDetailResponse;
import com.university.thesis.service.CouncilService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/councils")
@RequiredArgsConstructor
public class CouncilController {

    private final CouncilService councilService;

    @GetMapping
    public ResponseEntity<List<CouncilDetailResponse>> getAllCouncils() {
        return ResponseEntity.ok(councilService.getAllCouncils());
    }

    @PostMapping
    public ResponseEntity<CouncilDetailResponse> createCouncil(
            @Valid @RequestBody CreateCouncilRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(councilService.createCouncil(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<CouncilDetailResponse> updateCouncil(
            @PathVariable Long id,
            @Valid @RequestBody CreateCouncilRequest request) {
        return ResponseEntity.ok(councilService.updateCouncil(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCouncil(@PathVariable Long id) {
        councilService.deleteCouncil(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{id}")
    public ResponseEntity<CouncilDetailResponse> getCouncilDetail(@PathVariable Long id) {
        return ResponseEntity.ok(councilService.getCouncilDetail(id));
    }

    @PutMapping("/{id}/lock")
    public ResponseEntity<CouncilDetailResponse> lockCouncil(@PathVariable Long id) {
        return ResponseEntity.ok(councilService.lockCouncil(id));
    }

    @PutMapping("/{id}/unlock")
    public ResponseEntity<CouncilDetailResponse> unlockCouncil(@PathVariable Long id) {
        return ResponseEntity.ok(councilService.unlockCouncil(id));
    }

    @PutMapping("/{id}/assign-thesis")
    public ResponseEntity<CouncilDetailResponse> assignTheses(
            @PathVariable Long id,
            @Valid @RequestBody AssignCouncilThesisRequest request) {
        return ResponseEntity.ok(councilService.assignTheses(id, request));
    }

    @PostMapping("/{id}/members")
    public ResponseEntity<CouncilDetailResponse> addMember(
            @PathVariable Long id,
            @Valid @RequestBody AddCouncilMemberRequest request) {
        return ResponseEntity.ok(councilService.addMember(id, request));
    }

    @DeleteMapping("/{id}/members/{uId}")
    public ResponseEntity<CouncilDetailResponse> removeMember(
            @PathVariable Long id,
            @PathVariable Long uId) {
        return ResponseEntity.ok(councilService.removeMember(id, uId));
    }

    @PostMapping("/{id}/criteria")
    public ResponseEntity<CouncilDetailResponse> setCriteria(
            @PathVariable Long id,
            @Valid @RequestBody SetCriteriaRequest request) {
        return ResponseEntity.ok(councilService.setCriteria(id, request));
    }
}
