package com.university.thesis.repository;

import com.university.thesis.entity.Thesis;
import com.university.thesis.entity.ThesisStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ThesisRepository extends JpaRepository<Thesis, Long> {

    List<Thesis> findByStatus(ThesisStatus status);

    @Query("SELECT t FROM Thesis t WHERE " +
           "LOWER(t.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(t.major) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<Thesis> searchByKeyword(@Param("keyword") String keyword);

    @Query("SELECT t FROM Thesis t WHERE " +
           "(:keyword IS NULL OR LOWER(t.title) LIKE LOWER(CONCAT('%', :keyword, '%'))) AND " +
           "(:year IS NULL OR t.academicYear = :year) AND " +
           "(:major IS NULL OR t.major = :major)")
    List<Thesis> searchTheses(@Param("keyword") String keyword,
                              @Param("year") String year,
                              @Param("major") String major);

    @Query("SELECT t FROM Thesis t WHERE t.academicYear = :year")
    List<Thesis> findByAcademicYear(@Param("year") String year);

    List<Thesis> findByReviewerId(Long reviewerId);
}
