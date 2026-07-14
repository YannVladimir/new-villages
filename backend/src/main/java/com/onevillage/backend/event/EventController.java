package com.onevillage.backend.event;

import com.onevillage.backend.common.PageResponse;
import com.onevillage.backend.event.dto.CreateEventRequest;
import com.onevillage.backend.event.dto.EventResponse;
import com.onevillage.backend.event.dto.RsvpRequest;
import com.onevillage.backend.security.SecurityUtils;
import jakarta.validation.Valid;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/events")
public class EventController {

    private final EventService eventService;

    public EventController(EventService eventService) {
        this.eventService = eventService;
    }

    @GetMapping
    public PageResponse<EventResponse> list(@RequestParam(required = false) UUID communityId,
                                             @RequestParam(defaultValue = "false") boolean upcoming,
                                             @RequestParam(defaultValue = "0") int page,
                                             @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("startAt").ascending());
        return PageResponse.from(eventService.list(communityId, upcoming, SecurityUtils.currentUserId(), pageable));
    }

    @GetMapping("/{id}")
    public EventResponse getOne(@PathVariable UUID id) {
        return eventService.getById(id, SecurityUtils.currentUserId());
    }

    @PostMapping
    public ResponseEntity<EventResponse> create(@Valid @RequestBody CreateEventRequest request) {
        return ResponseEntity.status(201).body(eventService.create(SecurityUtils.currentUserId(), request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        eventService.delete(id, SecurityUtils.currentUserId());
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/rsvp")
    public EventResponse rsvp(@PathVariable UUID id, @Valid @RequestBody RsvpRequest request) {
        return eventService.rsvp(id, SecurityUtils.currentUserId(), request.status());
    }
}
