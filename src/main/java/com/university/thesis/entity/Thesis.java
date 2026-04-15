package com.university.thesis.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "theses")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Thesis {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "academic_year", nullable = false)
    private String academicYear;

    @Column(nullable = false)
    private String major;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private ThesisStatus status = ThesisStatus.CREATED;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reviewer_id")
    private User reviewer;

    @Column(name = "average_score")
    private Double averageScore;

    @Column(name = "grade_classification")
    private String gradeClassification;

    @OneToMany(mappedBy = "thesis", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<ThesisStudent> students = new ArrayList<>();

    @OneToMany(mappedBy = "thesis", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<ThesisLecturer> lecturers = new ArrayList<>();

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
