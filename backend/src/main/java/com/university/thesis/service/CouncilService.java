package com.university.thesis.service;

import com.university.thesis.dto.request.*;
import com.university.thesis.dto.response.CouncilDetailResponse;

import java.util.List;

public interface CouncilService {

    List<CouncilDetailResponse> getAllCouncils();
    CouncilDetailResponse createCouncil(CreateCouncilRequest request);
    CouncilDetailResponse updateCouncil(Long councilId, CreateCouncilRequest request);
    void deleteCouncil(Long councilId);
    CouncilDetailResponse addMember(Long councilId, AddCouncilMemberRequest request);
    CouncilDetailResponse removeMember(Long councilId, Long userId);
    CouncilDetailResponse assignTheses(Long councilId, AssignCouncilThesisRequest request);
    CouncilDetailResponse setCriteria(Long councilId, SetCriteriaRequest request);
    CouncilDetailResponse getCouncilDetail(Long councilId);
    CouncilDetailResponse lockCouncil(Long councilId);
    CouncilDetailResponse unlockCouncil(Long councilId);
}
