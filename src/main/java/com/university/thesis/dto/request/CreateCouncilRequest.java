package com.university.thesis.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import java.util.List;

@Data
public class CreateCouncilRequest {

    @NotBlank(message = "Tên hội đồng không được để trống")
    private String name;

    private String date;

    private String room;

    /** Danh sách thành viên kèm vai trò */
    private List<MemberItem> members;

    /** Danh sách ID khoá luận */
    private List<Long> thesisIds;

    @Data
    public static class MemberItem {
        private Long lecturerId;
        private String councilRole;
    }
}
