package com.onevillage.backend.terms;

import com.onevillage.backend.common.ApiException;
import com.onevillage.backend.terms.dto.TermsStatusResponse;
import com.onevillage.backend.terms.dto.TermsVersionResponse;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

@Service
public class TermsService {

    private final TermsVersionRepository termsVersionRepository;
    private final UserTermsAcceptanceRepository acceptanceRepository;

    public TermsService(TermsVersionRepository termsVersionRepository,
                         UserTermsAcceptanceRepository acceptanceRepository) {
        this.termsVersionRepository = termsVersionRepository;
        this.acceptanceRepository = acceptanceRepository;
    }

    public TermsVersion getCurrentVersionEntity() {
        return termsVersionRepository.findByCurrentTrue()
                .orElseThrow(() -> ApiException.notFound("No Terms of Use version has been published yet"));
    }

    public TermsVersionResponse getCurrentVersion() {
        TermsVersion current = getCurrentVersionEntity();
        return new TermsVersionResponse(current.getVersion(), current.getBody(), current.getPublishedAt());
    }

    /**
     * The single source of truth used by {@link com.onevillage.backend.security.TermsGateFilter}.
     * A user with no acceptance record at all is not up to date.
     */
    public boolean hasAcceptedCurrentVersion(UUID userId) {
        TermsVersion current = getCurrentVersionEntity();
        return acceptanceRepository.existsByUserIdAndTermsVersionId(userId, current.getId());
    }

    public TermsStatusResponse getStatus(UUID userId) {
        TermsVersion current = getCurrentVersionEntity();
        Optional<UserTermsAcceptance> last = acceptanceRepository.findTopByUserIdOrderByAcceptedAtDesc(userId);
        boolean upToDate = last.isPresent() && last.get().getTermsVersionId().equals(current.getId());
        String acceptedVersion = last.map(a -> a.getTermsVersionId().equals(current.getId()) ? current.getVersion() : "outdated").orElse(null);
        return new TermsStatusResponse(upToDate, current.getVersion(), acceptedVersion);
    }

    /**
     * Records acceptance. Rejects if the client is trying to accept a version that
     * is no longer (or not yet) the published current version — this prevents
     * accepting a stale/cached copy of the Terms page.
     */
    @Transactional
    public void recordAcceptance(UUID userId, String version, String ipAddress) {
        TermsVersion current = getCurrentVersionEntity();
        if (!current.getVersion().equals(version)) {
            throw ApiException.badRequest("The Terms version you accepted is no longer current. Please reload and try again.");
        }
        if (acceptanceRepository.existsByUserIdAndTermsVersionId(userId, current.getId())) {
            return;
        }
        UserTermsAcceptance acceptance = new UserTermsAcceptance();
        acceptance.setUserId(userId);
        acceptance.setTermsVersionId(current.getId());
        acceptance.setAcceptedAt(Instant.now());
        acceptance.setIpAddress(ipAddress);
        acceptanceRepository.save(acceptance);
    }

    public record AcceptanceInfo(String version, Instant acceptedAt) {
    }

    public Optional<AcceptanceInfo> getLatestAcceptanceInfo(UUID userId) {
        return acceptanceRepository.findTopByUserIdOrderByAcceptedAtDesc(userId)
                .map(a -> new AcceptanceInfo(
                        termsVersionRepository.findById(a.getTermsVersionId()).map(TermsVersion::getVersion).orElse(null),
                        a.getAcceptedAt()));
    }

    @Transactional
    public TermsVersionResponse publishNewVersion(String version, String body) {
        termsVersionRepository.findByCurrentTrue().ifPresent(previous -> {
            previous.setCurrent(false);
            termsVersionRepository.save(previous);
        });
        TermsVersion next = new TermsVersion();
        next.setVersion(version);
        next.setBody(body);
        next.setPublishedAt(Instant.now());
        next.setCurrent(true);
        termsVersionRepository.save(next);
        return new TermsVersionResponse(next.getVersion(), next.getBody(), next.getPublishedAt());
    }
}
