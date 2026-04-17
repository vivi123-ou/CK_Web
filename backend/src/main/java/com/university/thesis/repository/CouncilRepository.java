package com.university.thesis.repository;

import com.university.thesis.entity.Council;
import com.university.thesis.entity.CouncilStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface CouncilRepository extends JpaRepository<Council, Long> {

    List<Council> findByStatus(CouncilStatus status);
}
