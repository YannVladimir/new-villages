package com.onevillage.backend.event;

import com.onevillage.backend.common.ApiException;
import com.onevillage.backend.community.Community;
import com.onevillage.backend.community.CommunityRepository;
import com.onevillage.backend.event.dto.CreateEventRequest;
import com.onevillage.backend.event.dto.EventResponse;
import com.onevillage.backend.organization.Organization;
import com.onevillage.backend.organization.OrganizationRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.UUID;

@Service
public class EventService {

    private final EventRepository eventRepository;
    private final EventRsvpRepository rsvpRepository;
    private final CommunityRepository communityRepository;
    private final OrganizationRepository organizationRepository;

    public EventService(EventRepository eventRepository,
                         EventRsvpRepository rsvpRepository,
                         CommunityRepository communityRepository,
                         OrganizationRepository organizationRepository) {
        this.eventRepository = eventRepository;
        this.rsvpRepository = rsvpRepository;
        this.communityRepository = communityRepository;
        this.organizationRepository = organizationRepository;
    }

    @Transactional
    public EventResponse create(UUID userId, CreateEventRequest request) {
        EventType type;
        try {
            type = EventType.valueOf(request.type().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw ApiException.badRequest("Invalid event type");
        }

        if (request.communityId() != null) {
            Community community = communityRepository.findById(request.communityId())
                    .orElseThrow(() -> ApiException.notFound("Community not found"));
            if (!community.getLeaderId().equals(userId)) {
                throw ApiException.forbidden("Only the community leader can publish events for this community");
            }
        } else if (request.organizationId() != null) {
            Organization org = organizationRepository.findById(request.organizationId())
                    .orElseThrow(() -> ApiException.notFound("Organization not found"));
            if (!org.getOwnerUserId().equals(userId)) {
                throw ApiException.forbidden("Only the organization owner can publish events for this organization");
            }
        } else {
            throw ApiException.badRequest("An event must belong to a community or an organization");
        }

        Event event = new Event();
        event.setCommunityId(request.communityId());
        event.setOrganizationId(request.organizationId());
        event.setTitle(request.title());
        event.setDescription(request.description());
        event.setType(type);
        event.setStartAt(request.startAt());
        event.setOnline(request.online());
        event.setLocation(request.location());
        event.setOnlineLink(request.onlineLink());
        event.setCoverImageUrl(request.coverImageUrl());
        event.setCreatedBy(userId);
        // saveAndFlush: toResponse() below reads event.getCreatedAt(), which
        // @CreationTimestamp only populates once the INSERT actually executes.
        eventRepository.saveAndFlush(event);

        return toResponse(event, userId);
    }

    public Page<EventResponse> list(UUID communityId, boolean upcomingOnly, UUID currentUserId, Pageable pageable) {
        return eventRepository.findFiltered(communityId, upcomingOnly, Instant.now(), pageable)
                .map(e -> toResponse(e, currentUserId));
    }

    public EventResponse getById(UUID id, UUID currentUserId) {
        return toResponse(getEntity(id), currentUserId);
    }

    public Event getEntity(UUID id) {
        return eventRepository.findById(id).orElseThrow(() -> ApiException.notFound("Event not found"));
    }

    @Transactional
    public void delete(UUID id, UUID userId) {
        Event event = getEntity(id);
        if (!event.getCreatedBy().equals(userId)) {
            throw ApiException.forbidden("Only the event creator can delete this event");
        }
        eventRepository.delete(event);
    }

    @Transactional
    public EventResponse rsvp(UUID eventId, UUID userId, String statusRaw) {
        getEntity(eventId);
        RsvpStatus status;
        try {
            status = RsvpStatus.valueOf(statusRaw.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw ApiException.badRequest("Invalid RSVP status");
        }
        EventRsvp rsvp = rsvpRepository.findByEventIdAndUserId(eventId, userId).orElseGet(EventRsvp::new);
        rsvp.setEventId(eventId);
        rsvp.setUserId(userId);
        rsvp.setStatus(status);
        rsvp.setRespondedAt(Instant.now());
        rsvpRepository.save(rsvp);
        return toResponse(getEntity(eventId), userId);
    }

    private EventResponse toResponse(Event e, UUID currentUserId) {
        String communityName = e.getCommunityId() == null ? null : communityRepository.findNameById(e.getCommunityId()).orElse(null);
        String orgName = e.getOrganizationId() == null ? null
                : organizationRepository.findById(e.getOrganizationId()).map(Organization::getName).orElse(null);
        long goingCount = rsvpRepository.countByEventIdAndStatus(e.getId(), RsvpStatus.GOING);
        RsvpStatus myStatus = currentUserId == null ? null
                : rsvpRepository.findByEventIdAndUserId(e.getId(), currentUserId).map(EventRsvp::getStatus).orElse(null);

        return new EventResponse(e.getId(), e.getCommunityId(), communityName, e.getOrganizationId(), orgName,
                e.getTitle(), e.getDescription(), e.getType(), e.getStartAt(), e.isOnline(), e.getLocation(),
                e.getOnlineLink(), e.getCoverImageUrl(), e.getCreatedBy(), goingCount, myStatus, e.getCreatedAt());
    }
}
