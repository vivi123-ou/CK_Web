package com.university.thesis.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "thesis_lecturers",
       uniqueConstraints = @UniqueConstraint(columnNames = {"thesis_id", "lecturer_id"}))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ThesisLecturer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "thesis_id", nullable = false)
    private Thesis thesis;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "lecturer_id", nullable = false)
    private User lecturer;
}
