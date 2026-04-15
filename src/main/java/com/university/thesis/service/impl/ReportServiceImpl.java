package com.university.thesis.service.impl;

import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.Cell;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Table;
import com.itextpdf.layout.properties.TextAlignment;
import com.itextpdf.layout.properties.UnitValue;
import com.university.thesis.entity.*;
import com.university.thesis.exception.ResourceNotFoundException;
import com.university.thesis.repository.*;
import com.university.thesis.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ReportServiceImpl implements ReportService {

    private final ThesisRepository thesisRepository;
    private final ThesisStudentRepository thesisStudentRepository;
    private final ThesisLecturerRepository thesisLecturerRepository;
    private final GradeRepository gradeRepository;

    @Override
    @org.springframework.transaction.annotation.Transactional(readOnly = true)
    public byte[] generateThesisReport(Long thesisId) {
        Thesis thesis = thesisRepository.findById(thesisId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy khóa luận ID: " + thesisId));

        List<ThesisStudent> students = thesisStudentRepository.findByThesisId(thesisId);
        List<ThesisLecturer> lecturers = thesisLecturerRepository.findByThesisId(thesisId);
        List<Grade> grades = gradeRepository.findByThesisId(thesisId);

        try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            PdfWriter writer = new PdfWriter(baos);
            PdfDocument pdfDoc = new PdfDocument(writer);
            Document document = new Document(pdfDoc);

            // Title
            document.add(new Paragraph("BÁO CÁO KẾT QUẢ KHÓA LUẬN TỐT NGHIỆP")
                    .setTextAlignment(TextAlignment.CENTER).setFontSize(16).setBold());
            document.add(new Paragraph("\n"));

            // Thesis info
            document.add(new Paragraph("Tên đề tài: " + thesis.getTitle()).setFontSize(12));
            document.add(new Paragraph("Ngành: " + thesis.getMajor()).setFontSize(12));
            document.add(new Paragraph("Niên khóa: " + thesis.getAcademicYear()).setFontSize(12));
            document.add(new Paragraph("Trạng thái: " + thesis.getStatus().name()).setFontSize(12));
            document.add(new Paragraph("\n"));

            // Students
            document.add(new Paragraph("DANH SÁCH SINH VIÊN:").setBold().setFontSize(12));
            for (int i = 0; i < students.size(); i++) {
                User student = students.get(i).getStudent();
                document.add(new Paragraph((i + 1) + ". " + student.getFullName() + " - " + student.getEmail()));
            }
            document.add(new Paragraph("\n"));

            // Lecturers
            document.add(new Paragraph("GIẢNG VIÊN HƯỚNG DẪN:").setBold().setFontSize(12));
            lecturers.forEach(tl ->
                    document.add(new Paragraph("- " + tl.getLecturer().getFullName() + " - " + tl.getLecturer().getEmail())));

            if (thesis.getReviewer() != null) {
                document.add(new Paragraph("\nGIẢNG VIÊN PHẢN BIỆN:").setBold().setFontSize(12));
                document.add(new Paragraph("- " + thesis.getReviewer().getFullName() + " - " + thesis.getReviewer().getEmail()));
            }
            document.add(new Paragraph("\n"));

            // Grade table
            if (!grades.isEmpty()) {
                document.add(new Paragraph("BẢNG ĐIỂM CHI TIẾT:").setBold().setFontSize(12));
                document.add(new Paragraph("\n"));

                Table table = new Table(UnitValue.createPercentArray(new float[]{3, 2, 2}))
                        .setWidth(UnitValue.createPercentValue(100));
                table.addHeaderCell(new Cell().add(new Paragraph("Giảng viên").setBold()));
                table.addHeaderCell(new Cell().add(new Paragraph("Tổng điểm").setBold()));
                table.addHeaderCell(new Cell().add(new Paragraph("Xác nhận").setBold()));

                grades.forEach(grade -> {
                    table.addCell(new Cell().add(new Paragraph(grade.getLecturer().getFullName())));
                    table.addCell(new Cell().add(new Paragraph(
                            grade.getTotalScore() != null ? String.valueOf(grade.getTotalScore()) : "N/A")));
                    table.addCell(new Cell().add(new Paragraph(grade.isConfirmed() ? "Đã xác nhận" : "Chưa")));
                });
                document.add(table);
            }

            // Average & classification
            document.add(new Paragraph("\n"));
            if (thesis.getAverageScore() != null) {
                document.add(new Paragraph("ĐIỂM TRUNG BÌNH: " + thesis.getAverageScore()).setBold().setFontSize(14));
                document.add(new Paragraph("XẾP LOẠI: " + thesis.getGradeClassification()).setBold().setFontSize(14));
            }

            // Signatures
            document.add(new Paragraph("\n\n\n"));
            Table sigTable = new Table(UnitValue.createPercentArray(new float[]{1, 1, 1}))
                    .setWidth(UnitValue.createPercentValue(100));
            sigTable.addCell(new Cell().setBorder(null).add(new Paragraph("Chủ tịch HĐ\n\n\n\n(Ký và ghi rõ họ tên)").setTextAlignment(TextAlignment.CENTER)));
            sigTable.addCell(new Cell().setBorder(null).add(new Paragraph("Thư ký HĐ\n\n\n\n(Ký và ghi rõ họ tên)").setTextAlignment(TextAlignment.CENTER)));
            sigTable.addCell(new Cell().setBorder(null).add(new Paragraph("GVHD\n\n\n\n(Ký và ghi rõ họ tên)").setTextAlignment(TextAlignment.CENTER)));
            document.add(sigTable);

            document.close();
            return baos.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Lỗi khi tạo PDF: " + e.getMessage(), e);
        }
    }
}
