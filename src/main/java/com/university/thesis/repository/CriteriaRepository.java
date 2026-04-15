package com.university.thesis.repository;

import com.university.thesis.entity.Criteria;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Repository
public interface CriteriaRepository extends JpaRepository<Criteria, Long> {

    List<Criteria> findByCouncilId(Long councilId);

    @Query("SELECT COALESCE(SUM(c.weightPercent), 0) FROM Criteria c WHERE c.council.id = :councilId")
    int sumWeightByCouncilId(@Param("councilId") Long councilId);

    @Modifying
    @Transactional
    void deleteByCouncilId(Long councilId);
}

