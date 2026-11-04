package com.onevillage.backend.community;

import com.onevillage.backend.common.ApiException;
import com.onevillage.backend.event.EventRepository;
import com.onevillage.backend.user.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * Covers the invitation-response authorization check: an invitation must only be
 * accepted/declined by the user it was actually sent to. Before this fix,
 * respondToInvitation() trusted any authenticated caller's user id blindly, so
 * anyone who learned/guessed an invitation UUID could join a community (including
 * a private one) they were never invited to, or silently decline someone else's
 * pending invitation.
 */
@ExtendWith(MockitoExtension.class)
class CommunityServiceTest {

    @Mock
    private CommunityRepository communityRepository;
    @Mock
    private CommunityMembershipRepository membershipRepository;
    @Mock
    private CommunityCreationRequestRepository creationRequestRepository;
    @Mock
    private CommunityInvitationRepository invitationRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private EventRepository eventRepository;

    private CommunityService communityService;

    @BeforeEach
    void setUp() {
        communityService = new CommunityService(communityRepository, membershipRepository,
                creationRequestRepository, invitationRepository, userRepository, eventRepository);
    }

    private CommunityInvitation invitationFor(UUID invitedUserId, String invitedEmail) {
        CommunityInvitation invitation = new CommunityInvitation();
        invitation.setCommunityId(UUID.randomUUID());
        invitation.setInvitedBy(UUID.randomUUID());
        invitation.setInvitedUserId(invitedUserId);
        invitation.setInvitedEmail(invitedEmail);
        return invitation;
    }

    @Test
    void respondToInvitation_rejectsUserTheInvitationWasNotSentTo() {
        UUID invitationId = UUID.randomUUID();
        CommunityInvitation invitation = invitationFor(UUID.randomUUID(), "invitee@onevillage.ca");
        when(invitationRepository.findById(invitationId)).thenReturn(Optional.of(invitation));

        UUID attackerId = UUID.randomUUID();

        assertThatThrownBy(() -> communityService.respondToInvitation(invitationId, attackerId, "attacker@onevillage.ca", true))
                .isInstanceOf(ApiException.class)
                .hasMessageContaining("not sent to you");

        verify(invitationRepository, never()).save(any());
        verify(membershipRepository, never()).save(any());
    }

    @Test
    void respondToInvitation_allowsTheMatchingInvitedUserId() {
        UUID invitationId = UUID.randomUUID();
        UUID invitedUserId = UUID.randomUUID();
        CommunityInvitation invitation = invitationFor(invitedUserId, "invitee@onevillage.ca");
        when(invitationRepository.findById(invitationId)).thenReturn(Optional.of(invitation));
        when(membershipRepository.findByCommunityIdAndUserId(any(), any())).thenReturn(Optional.empty());

        communityService.respondToInvitation(invitationId, invitedUserId, "invitee@onevillage.ca", true);

        assertThat(invitation.getStatus()).isEqualTo(InvitationStatus.ACCEPTED);
        verify(membershipRepository).save(any(CommunityMembership.class));
    }

    @Test
    void respondToInvitation_allowsMatchByEmailWhenInvitationWasSentBeforeAccountExisted() {
        UUID invitationId = UUID.randomUUID();
        CommunityInvitation invitation = invitationFor(null, "invitee@onevillage.ca");
        when(invitationRepository.findById(invitationId)).thenReturn(Optional.of(invitation));
        when(membershipRepository.findByCommunityIdAndUserId(any(), any())).thenReturn(Optional.empty());

        UUID newlyRegisteredUserId = UUID.randomUUID();

        communityService.respondToInvitation(invitationId, newlyRegisteredUserId, "Invitee@OneVillage.ca", true);

        assertThat(invitation.getStatus()).isEqualTo(InvitationStatus.ACCEPTED);
    }

    @Test
    void respondToInvitation_rejectsAlreadyRespondedInvitation() {
        UUID invitationId = UUID.randomUUID();
        UUID invitedUserId = UUID.randomUUID();
        CommunityInvitation invitation = invitationFor(invitedUserId, "invitee@onevillage.ca");
        invitation.setStatus(InvitationStatus.DECLINED);
        when(invitationRepository.findById(invitationId)).thenReturn(Optional.of(invitation));

        assertThatThrownBy(() -> communityService.respondToInvitation(invitationId, invitedUserId, "invitee@onevillage.ca", true))
                .isInstanceOf(ApiException.class)
                .hasMessageContaining("already been responded to");

        verify(membershipRepository, never()).save(any());
    }
}
