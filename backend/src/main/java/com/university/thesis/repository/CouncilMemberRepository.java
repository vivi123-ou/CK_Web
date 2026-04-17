package com.university.thesis.repository;

import com.university.thesis.entity.CouncilMember;
import com.university.thesis.entity.CouncilMemberRole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface CouncilMemberRepository extends JpaRepository<CouncilMember, Long> {

    List<CouncilMember> findByCouncilId(Long councilId);

    int countByCouncilId(Long councilId);

    boolean existsByCouncilIdAndUserId(Long councilId, Long userId);

    Optional<CouncilMember> findByCouncilIdAndUserId(Long councilId, Long userId);

    @Query("SELECT cm FROM CouncilMember cm WHERE cm.council.id = :councilId AND cm.memberRole = :role")
    List<CouncilMember> findByCouncilIdAndMemberRole(@Param("councilId") Long councilId,
                                                      @Param("role") CouncilMemberRole role);

    @Query("SELECT cm FROM CouncilMember cm WHERE cm.user.id = :userId")
    List<CouncilMember> findByUserId(@Param("userId") Long userId);
}
