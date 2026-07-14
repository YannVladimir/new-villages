package com.onevillage.backend.messaging;

import com.onevillage.backend.common.PageResponse;
import com.onevillage.backend.messaging.dto.ConversationResponse;
import com.onevillage.backend.messaging.dto.MessageResponse;
import com.onevillage.backend.messaging.dto.SendMessageRequest;
import com.onevillage.backend.messaging.dto.StartConversationRequest;
import com.onevillage.backend.security.SecurityUtils;
import jakarta.validation.Valid;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/conversations")
public class MessagingController {

    private final MessagingService messagingService;

    public MessagingController(MessagingService messagingService) {
        this.messagingService = messagingService;
    }

    @GetMapping
    public List<ConversationResponse> list() {
        return messagingService.listConversations(SecurityUtils.currentUserId());
    }

    @PostMapping
    public ResponseEntity<ConversationResponse> start(@Valid @RequestBody StartConversationRequest request) {
        return ResponseEntity.status(201).body(messagingService.startConversation(SecurityUtils.currentUserId(), request));
    }

    @GetMapping("/{id}/messages")
    public PageResponse<MessageResponse> messages(@PathVariable UUID id,
                                                    @RequestParam(defaultValue = "0") int page,
                                                    @RequestParam(defaultValue = "30") int size) {
        return PageResponse.from(messagingService.getMessages(id, SecurityUtils.currentUserId(), PageRequest.of(page, size)));
    }

    @PostMapping("/{id}/messages")
    public MessageResponse send(@PathVariable UUID id, @Valid @RequestBody SendMessageRequest request) {
        return messagingService.sendMessage(id, SecurityUtils.currentUserId(), request.body());
    }
}
