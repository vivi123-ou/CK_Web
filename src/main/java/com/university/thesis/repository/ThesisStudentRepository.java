package com.university.thesis.repository;

import com.university.thesis.entity.ThesisStudent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ThesisStudentRepository extends JpaRepository<ThesisStudent, Long> {

    List<ThesisStudent> findByThesisId(Long thesisId);

    List<ThesisStudent> findByStudentId(Long studentId);

    @Query("SELECT ts FROM ThesisStudent ts WHERE ts.student.id = :studentId AND ts.thesis.academicYear = :year")
    List<ThesisStudent> findByStudentIdAndAcademicYear(@Param("studentId") Long studentId, @Param("year") String year);
}
