package com.university.thesis.controller;

import com.university.thesis.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/reports")
@RequiredArgsConstructor
public class ReportController {

    private final ReportService reportService;

    /**
     * UC-033: Xuất báo cáo PDF
     * GET /api/reports/pdf/{thesisId}
     */
    @GetMapping("/pdf/{thesisId}")
    public ResponseEntity<byte[]> exportThesisPdf(@PathVariable Long thesisId) {
        byte[] pdfBytes = reportService.generateThesisReport(thesisId);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDispositionFormData("attachment", "thesis_report_" + thesisId + ".pdf");
        headers.setContentLength(pdfBytes.length);

        return ResponseEntity.ok()
                .headers(headers)
                .body(pdfBytes);
    }
}
