package com.onevillage.backend.terms;

import com.onevillage.backend.common.ApiException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TermsServiceTest {

    @Mock
    private TermsVersionRepository termsVersionRepository;

    @Mock
    private UserTermsAcceptanceRepository acceptanceRepository;

    private TermsService termsService;

    @BeforeEach
    void setUp() {
        termsService = new TermsService(termsVersionRepository, acceptanceRepository);
    }

    @Test
    void recordAcceptance_rejectsStaleVersion() {
        TermsVersion current = new TermsVersion();
        current.setVersion("2.0.0");
        when(termsVersionRepository.findByCurrentTrue()).thenReturn(Optional.of(current));

        assertThatThrownBy(() -> termsService.recordAcceptance(UUID.randomUUID(), "1.0.0", "127.0.0.1"))
                .isInstanceOf(ApiException.class)
                .hasMessageContaining("no longer current");

        verify(acceptanceRepository, never()).save(any());
    }

    @Test
    void recordAcceptance_savesWhenVersionMatchesCurrent() {
        TermsVersion current = new TermsVersion();
        current.setVersion("1.0.0");
        when(termsVersionRepository.findByCurrentTrue()).thenReturn(Optional.of(current));
        when(acceptanceRepository.existsByUserIdAndTermsVersionId(any(), any())).thenReturn(false);

        UUID userId = UUID.randomUUID();
        termsService.recordAcceptance(userId, "1.0.0", "127.0.0.1");

        verify(acceptanceRepository).save(any(UserTermsAcceptance.class));
    }

    @Test
    void hasAcceptedCurrentVersion_falseWhenNoAcceptanceRecorded() {
        TermsVersion current = new TermsVersion();
        current.setVersion("1.0.0");
        when(termsVersionRepository.findByCurrentTrue()).thenReturn(Optional.of(current));
        when(acceptanceRepository.existsByUserIdAndTermsVersionId(any(), any())).thenReturn(false);

        assertThat(termsService.hasAcceptedCurrentVersion(UUID.randomUUID())).isFalse();
    }
}
