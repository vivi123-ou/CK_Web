package com.university.thesis.service;

public interface EmailService {

    void sendReviewerAssignmentEmail(String reviewerEmail, String thesisTitle);
    void sendGradeNotificationEmail(String studentEmail, String thesisTitle, Double averageScore, String classification);
}
