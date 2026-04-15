package com.university.thesis.dto.request;

import jakarta.validation.constraints.NotEmpty;
import lombok.Data;
import java.util.List;

@Data
public class AssignCouncilThesisRequest {

    @NotEmpty(message = "Danh sách ID khóa luận không được để trống")
    private List<Long> thesisIds;
}

