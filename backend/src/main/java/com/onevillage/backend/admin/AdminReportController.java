package com.onevillage.backend.admin;

import com.onevillage.backend.moderation.ReportService;
import com.onevillage.backend.moderation.dto.ReportResponse;
import com.onevillage.backend.moderation.dto.ResolveReportRequest;
import com.onevillage.backend.security.SecurityUtils;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin/reports")
public class AdminReportController {

    private final ReportService reportService;

    public AdminReportController(ReportService reportService) {
        this.reportService = reportService;
    }

    @GetMapping
    public List<ReportResponse> list() {
        return reportService.listAll();
    }

    @PostMapping("/{id}/resolve")
    public ResponseEntity<Void> resolve(@PathVariable UUID id, @Valid @RequestBody ResolveReportRequest request) {
        reportService.resolve(id, SecurityUtils.currentUserId(), request.action());
        return ResponseEntity.noContent().build();
    }
}
