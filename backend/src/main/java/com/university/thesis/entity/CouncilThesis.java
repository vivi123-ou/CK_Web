package com.university.thesis.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "council_theses",
       uniqueConstraints = @UniqueConstraint(columnNames = {"council_id", "thesis_id"}))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CouncilThesis {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "council_id", nullable = false)
    private Council council;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "thesis_id", nullable = false)
    private Thesis thesis;
}
