package com.university.thesis.repository;

import com.university.thesis.entity.CouncilThesis;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface CouncilThesisRepository extends JpaRepository<CouncilThesis, Long> {

    List<CouncilThesis> findByCouncilId(Long councilId);

    int countByCouncilId(Long councilId);

    boolean existsByCouncilIdAndThesisId(Long councilId, Long thesisId);

    List<CouncilThesis> findByThesisId(Long thesisId);
}
