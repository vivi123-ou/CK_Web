package com.university.thesis.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "criteria")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Criteria {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "council_id", nullable = true)
    private Council council;

    @Column(nullable = false)
    private String name;

    @Column(name = "weight_percent", nullable = false)
    private Integer weightPercent;
}
