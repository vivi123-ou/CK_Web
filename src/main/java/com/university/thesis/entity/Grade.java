package com.university.thesis.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "grades",
       uniqueConstraints = @UniqueConstraint(columnNames = {"council_id", "thesis_id", "lecturer_id"}))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Grade {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "council_id", nullable = false)
    private Council council;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "thesis_id", nullable = false)
    private Thesis thesis;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "lecturer_id", nullable = false)
    private User lecturer;

    @Column(name = "total_score")
    private Double totalScore;

    @Column(name = "is_draft")
    @Builder.Default
    private boolean draft = true;

    @Column(name = "is_confirmed")
    @Builder.Default
    private boolean confirmed = false;

    @OneToMany(mappedBy = "grade", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<GradeDetail> details = new ArrayList<>();

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
