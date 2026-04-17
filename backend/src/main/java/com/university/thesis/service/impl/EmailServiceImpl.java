package com.university.thesis.service.impl;

import com.university.thesis.service.EmailService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class EmailServiceImpl implements EmailService {

    @Override
    @Async
    public void sendReviewerAssignmentEmail(String reviewerEmail, String thesisTitle) {
        log.info("📧 [EMAIL STUB] Gửi email thông báo phản biện đến: {} cho khóa luận: {}",
                reviewerEmail, thesisTitle);
    }

    @Override
    @Async
    public void sendGradeNotificationEmail(String studentEmail, String thesisTitle,
                                            Double averageScore, String classification) {
        log.info("📧 [EMAIL STUB] Gửi email thông báo điểm đến: {} - Khóa luận: {} - Điểm: {} - Xếp loại: {}",
                studentEmail, thesisTitle, averageScore, classification);
    }
}
