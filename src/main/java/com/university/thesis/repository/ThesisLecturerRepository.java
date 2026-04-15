package com.university.thesis.repository;

import com.university.thesis.entity.ThesisLecturer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ThesisLecturerRepository extends JpaRepository<ThesisLecturer, Long> {

    List<ThesisLecturer> findByThesisId(Long thesisId);

    List<ThesisLecturer> findByLecturerId(Long lecturerId);
}
