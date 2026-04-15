package com.university.thesis.repository;

import com.university.thesis.entity.GradeDetail;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface GradeDetailRepository extends JpaRepository<GradeDetail, Long> {

    List<GradeDetail> findByGradeId(Long gradeId);
}
