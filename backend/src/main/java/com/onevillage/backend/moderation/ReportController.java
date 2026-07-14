package com.onevillage.backend.moderation;

import com.onevillage.backend.moderation.dto.ReportResponse;
import com.onevillage.backend.moderation.dto.SubmitReportRequest;
import com.onevillage.backend.security.SecurityUtils;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/reports")
public class ReportController {

    private final ReportService reportService;

    public ReportController(ReportService reportService) {
        this.reportService = reportService;
    }

    @PostMapping
    public ResponseEntity<ReportResponse> submit(@Valid @RequestBody SubmitReportRequest request) {
        ReportResponse response = reportService.submit(SecurityUtils.currentUserId(), request.targetType(),
                request.targetId(), request.reason(), request.details());
        return ResponseEntity.status(201).body(response);
    }
}
