package com.university.thesis.repository;

import com.university.thesis.entity.Grade;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface GradeRepository extends JpaRepository<Grade, Long> {

    List<Grade> findByCouncilId(Long councilId);

    List<Grade> findByThesisId(Long thesisId);

    List<Grade> findByLecturerId(Long lecturerId);

    Optional<Grade> findByCouncilIdAndThesisIdAndLecturerId(Long councilId, Long thesisId, Long lecturerId);

    @Query("SELECT g FROM Grade g WHERE g.council.id = :councilId AND g.confirmed = false")
    List<Grade> findUnconfirmedByCouncilId(@Param("councilId") Long councilId);

    @Query("SELECT g FROM Grade g WHERE g.thesis.id = :thesisId AND g.confirmed = true")
    List<Grade> findConfirmedByThesisId(@Param("thesisId") Long thesisId);

    @Query("SELECT AVG(g.totalScore) FROM Grade g WHERE g.thesis.id = :thesisId AND g.confirmed = true")
    Double calculateAverageScoreByThesisId(@Param("thesisId") Long thesisId);
}
