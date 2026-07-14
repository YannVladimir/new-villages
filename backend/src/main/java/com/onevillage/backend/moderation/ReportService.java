package com.onevillage.backend.moderation;

import com.onevillage.backend.common.ApiException;
import com.onevillage.backend.community.Community;
import com.onevillage.backend.community.CommunityRepository;
import com.onevillage.backend.community.CommunityStatus;
import com.onevillage.backend.messaging.Message;
import com.onevillage.backend.messaging.MessageRepository;
import com.onevillage.backend.moderation.dto.ReportResponse;
import com.onevillage.backend.user.User;
import com.onevillage.backend.user.UserRepository;
import com.onevillage.backend.user.UserService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.UUID;

@Service
public class ReportService {

    private final ReportRepository reportRepository;
    private final UserRepository userRepository;
    private final UserService userService;
    private final MessageRepository messageRepository;
    private final CommunityRepository communityRepository;
    private final ActivityLogService activityLogService;

    public ReportService(ReportRepository reportRepository,
                          UserRepository userRepository,
                          UserService userService,
                          MessageRepository messageRepository,
                          CommunityRepository communityRepository,
                          ActivityLogService activityLogService) {
        this.reportRepository = reportRepository;
        this.userRepository = userRepository;
        this.userService = userService;
        this.messageRepository = messageRepository;
        this.communityRepository = communityRepository;
        this.activityLogService = activityLogService;
    }

    @Transactional
    public ReportResponse submit(UUID reporterId, String targetTypeRaw, UUID targetId, String reason, String details) {
        ReportTargetType targetType;
        try {
            targetType = ReportTargetType.valueOf(targetTypeRaw.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw ApiException.badRequest("targetType must be one of USER, COMMUNITY, MESSAGE");
        }

        Report report = new Report();
        report.setReporterId(reporterId);
        report.setTargetType(targetType);
        report.setTargetId(targetId);
        report.setReason(reason);
        report.setDetails(details);
        // saveAndFlush: toResponse() below reads report.getCreatedAt(), which
        // @CreationTimestamp only populates once the INSERT actually executes.
        reportRepository.saveAndFlush(report);

        return toResponse(report);
    }

    public java.util.List<ReportResponse> listAll() {
        return reportRepository.findAllByOrderByCreatedAtDesc().stream().map(this::toResponse).toList();
    }

    public long countOpen() {
        return reportRepository.countByStatus(ReportStatus.OPEN);
    }

    @Transactional
    public void resolve(UUID reportId, UUID adminId, String actionRaw) {
        Report report = reportRepository.findById(reportId)
                .orElseThrow(() -> ApiException.notFound("Report not found"));
        if (report.getStatus() == ReportStatus.RESOLVED) {
            throw ApiException.badRequest("This report has already been resolved");
        }

        String action = actionRaw.toUpperCase();
        switch (action) {
            case "REMOVE_CONTENT" -> removeContent(report);
            case "SUSPEND_USER" -> userService.suspend(resolveSubjectUserId(report));
            case "DISMISS" -> { /* no side effect */ }
            default -> throw ApiException.badRequest("action must be one of REMOVE_CONTENT, SUSPEND_USER, DISMISS");
        }

        report.setStatus(ReportStatus.RESOLVED);
        report.setResolvedBy(adminId);
        report.setResolvedAt(Instant.now());
        reportRepository.save(report);

        activityLogService.log(adminId, "Report resolved (" + action + ")", report.getTargetType().name(),
                report.getTargetId(), "Report #" + report.getId() + " — reason: " + report.getReason());
    }

    private void removeContent(Report report) {
        if (report.getTargetType() == ReportTargetType.MESSAGE) {
            messageRepository.findById(report.getTargetId()).ifPresent(messageRepository::delete);
        } else if (report.getTargetType() == ReportTargetType.COMMUNITY) {
            communityRepository.findById(report.getTargetId()).ifPresent(c -> {
                c.setStatus(CommunityStatus.ARCHIVED);
                communityRepository.save(c);
            });
        } else {
            throw ApiException.badRequest("REMOVE_CONTENT is not applicable to a reported user — use SUSPEND_USER instead");
        }
    }

    private UUID resolveSubjectUserId(Report report) {
        return switch (report.getTargetType()) {
            case USER -> report.getTargetId();
            case MESSAGE -> messageRepository.findById(report.getTargetId())
                    .map(Message::getSenderId)
                    .orElseThrow(() -> ApiException.notFound("Reported message no longer exists"));
            case COMMUNITY -> communityRepository.findById(report.getTargetId())
                    .map(Community::getLeaderId)
                    .orElseThrow(() -> ApiException.notFound("Reported community no longer exists"));
        };
    }

    private ReportResponse toResponse(Report r) {
        String reporterName = userRepository.findById(r.getReporterId()).map(User::getFullName).orElse("Unknown");
        String targetLabel = switch (r.getTargetType()) {
            case USER -> userRepository.findById(r.getTargetId()).map(User::getFullName).orElse("Unknown user");
            case COMMUNITY -> communityRepository.findNameById(r.getTargetId()).orElse("Unknown community");
            case MESSAGE -> "Message #" + r.getTargetId();
        };
        return new ReportResponse(r.getId(), reporterName, r.getTargetType(), r.getTargetId(), targetLabel,
                r.getReason(), r.getDetails(), r.getStatus(), r.getCreatedAt());
    }
}
