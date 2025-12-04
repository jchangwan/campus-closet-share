package com.campus.api;

import org.springframework.data.domain.*;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/messages")
public class MessageController {

    private final MessageRepository messageRepo;
    private final UserRepository userRepo;
    private final PostRepository postRepo;

    public MessageController(MessageRepository messageRepo,
                             UserRepository userRepo,
                             PostRepository postRepo) {
        this.messageRepo = messageRepo;
        this.userRepo = userRepo;
        this.postRepo = postRepo;
    }

    // ===== 1) 쪽지 보내기: POST /messages =====
    @PostMapping
    public MessageDto send(
            @RequestHeader("X-USER-ID") Long userId,
            @RequestBody SendMessageRequest req
    ) {
        if (req.receiverId == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "receiverId is required");
        }
        if (req.content == null || req.content.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "content is required");
        }

        User sender = userRepo.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Sender not found"));

        User receiver = userRepo.findById(req.receiverId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Receiver not found"));

        Post post = null;
        if (req.postId != null) {
            post = postRepo.findById(req.postId)
                    .orElse(null); // 게시글이 없어도 그냥 null로 보냄
        }

        Message msg = new Message(sender, receiver, post, req.content);
        Message saved = messageRepo.save(msg);

        return MessageDto.from(saved);
    }
    @GetMapping("/conversation")
    public List<MessageResponse> getConversation(
            @RequestParam Long postId,
            @RequestParam Long otherUserId,
            @RequestHeader("X-USER-ID") Long currentUserId
    ) {
        // 로그인 유저 확인 (선택)
        User me = userRepo.findById(currentUserId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.UNAUTHORIZED, "로그인 정보가 올바르지 않습니다."));

        List<Message> messages =
                messageRepo.findConversation(postId, currentUserId, otherUserId);

        return messages.stream()
                .map(MessageResponse::new)
                .toList();
    }
    public static class MessageResponse {
        public Long id;
        public Long senderId;
        public Long receiverId;
        public Long postId;
        public String content;
        public boolean isRead;
        public Instant createdAt;

        public MessageResponse(Message m) {
            this.id = m.getId();
            this.senderId = m.getSender().getId();
            this.receiverId = m.getReceiver().getId();
            this.postId = m.getPost().getId();
            this.content = m.getContent();
            this.isRead = m.isRead();
            this.createdAt = m.getCreatedAt();
        }
    }
    // ===== 2) 받은 쪽지함: GET /messages/inbox =====
    @GetMapping("/inbox")
    public MessagePageResponse inbox(
            @RequestHeader("X-USER-ID") Long userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt,desc") String sort
    ) {
        User receiver = userRepo.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "User not found"));

        // sort 파라미터는 일단 createdAt,desc만 지원
        Sort s = Sort.by(Sort.Direction.DESC, "createdAt");
        Pageable pageable = PageRequest.of(page, size, s);

        Page<Message> pageResult = messageRepo.findByReceiverOrderByCreatedAtDesc(receiver, pageable);

        MessagePageResponse resp = new MessagePageResponse();
        resp.content = pageResult.getContent().stream()
                .map(MessageDto::from)
                .collect(Collectors.toList());
        resp.page = pageResult.getNumber();
        resp.size = pageResult.getSize();
        resp.totalElements = pageResult.getTotalElements();
        resp.totalPages = pageResult.getTotalPages();
        resp.last = pageResult.isLast();
        return resp;
    }

    // ===== 3) 안 읽은 쪽지 개수: GET /messages/unread-count =====
    @GetMapping("/unread-count")
    public UnreadCountResponse unreadCount(
            @RequestHeader("X-USER-ID") Long userId
    ) {
        User receiver = userRepo.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "User not found"));

        long count = messageRepo.countByReceiverAndIsReadIsFalse(receiver);

        UnreadCountResponse resp = new UnreadCountResponse();
        resp.count = count;
        return resp;
    }

    // ===== 4) 쪽지 상세: GET /messages/{id} =====
    @GetMapping("/{id}")
    public MessageDto getMessage(
            @RequestHeader("X-USER-ID") Long userId,
            @PathVariable Long id
    ) {
        Message msg = messageRepo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Message not found"));

        Long senderId = msg.getSender().getId();
        Long receiverId = msg.getReceiver().getId();

        if (!senderId.equals(userId) && !receiverId.equals(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "You can only read your own messages");
        }

        // 받는 사람이 조회하면 읽음 처리
        if (receiverId.equals(userId) && !msg.isRead()) {
            msg.markRead();
            msg = messageRepo.save(msg);
        }

        return MessageDto.from(msg);
    }

    // ===== DTO =====

    public static class SendMessageRequest {
        public Long receiverId;
        public Long postId;
        public String content;
    }

    public static class MessageDto {
        public Long id;
        public Long senderId;
        public Long receiverId;
        public Long postId;
        public String content;
        public boolean isRead;
        public Instant createdAt;

        public static MessageDto from(Message m) {
            MessageDto dto = new MessageDto();
            dto.id = m.getId();
            dto.senderId = m.getSender() != null ? m.getSender().getId() : null;
            dto.receiverId = m.getReceiver() != null ? m.getReceiver().getId() : null;
            dto.postId = m.getPost() != null ? m.getPost().getId() : null;
            dto.content = m.getContent();
            dto.isRead = m.isRead();
            dto.createdAt = m.getCreatedAt();
            return dto;
        }
    }

    public static class MessagePageResponse {
        public List<MessageDto> content;
        public int page;
        public int size;
        public long totalElements;
        public int totalPages;
        public boolean last;
    }

    public static class UnreadCountResponse {
        public long count;
    }
}
