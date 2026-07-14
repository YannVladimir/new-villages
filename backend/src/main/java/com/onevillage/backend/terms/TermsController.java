package com.onevillage.backend.terms;

import com.onevillage.backend.security.SecurityUtils;
import com.onevillage.backend.terms.dto.AcceptTermsRequest;
import com.onevillage.backend.terms.dto.PublishTermsRequest;
import com.onevillage.backend.terms.dto.TermsStatusResponse;
import com.onevillage.backend.terms.dto.TermsVersionResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/terms")
public class TermsController {

    private final TermsService termsService;

    public TermsController(TermsService termsService) {
        this.termsService = termsService;
    }

    @GetMapping("/current")
    public TermsVersionResponse current() {
        return termsService.getCurrentVersion();
    }

    @GetMapping("/status")
    public TermsStatusResponse status() {
        return termsService.getStatus(SecurityUtils.currentUserId());
    }

    @PostMapping("/accept")
    public ResponseEntity<Void> accept(@Valid @RequestBody AcceptTermsRequest request, HttpServletRequest httpRequest) {
        termsService.recordAcceptance(SecurityUtils.currentUserId(), request.version(), httpRequest.getRemoteAddr());
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/publish")
    @PreAuthorize("hasRole('ADMIN')")
    public TermsVersionResponse publish(@Valid @RequestBody PublishTermsRequest request) {
        return termsService.publishNewVersion(request.version(), request.body());
    }
}
