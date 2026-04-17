package com.university.thesis.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "grade_details")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GradeDetail {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "grade_id", nullable = false)
    private Grade grade;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "criteria_id", nullable = false)
    private Criteria criteria;

    @Column(nullable = false)
    private Double score;
}
