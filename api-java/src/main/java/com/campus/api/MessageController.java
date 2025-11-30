package com.campus.api.message;

import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/messages")
public class MessageController {

    private final MessageRepository repo;

    public MessageController(MessageRepository repo) {
        this.repo = repo;
    }

    private Long mockUserId() { return 1L; } // 로그인 붙기 전 임시

    // ==================== 쪽지 보내기 ============================
    @PostMapping
    public Message sendMessage(@RequestBody SendMessageRequest req) {

        Message msg = new Message(
                mockUserId(),          // sender
                req.receiverId,
                req.postId,
                req.content
        );

        return repo.save(msg);
    }

    // ==================== 받은 쪽지함 ============================
    @GetMapping("/inbox")
    public List<Message> inbox() {
        return repo.findByReceiverIdOrderByCreatedAtDesc(mockUserId());
    }

    // ==================== 보낸 쪽지함 ============================
    @GetMapping("/sent")
    public List<Message> sent() {
        return repo.findBySenderIdOrderByCreatedAtDesc(mockUserId());
    }

    // ==================== 특정 쪽지 읽기 ============================
    @GetMapping("/{id}")
    public Message readMessage(@PathVariable Long id) {
        Message msg = repo.findById(id).orElseThrow();
        if (!msg.getReceiverId().equals(mockUserId())) {
            throw new RuntimeException("권한 없음");
        }
        msg.setRead(true);
        return repo.save(msg);
    }

    // ==================== 읽지 않은 쪽지 개수 ============================
    @GetMapping("/unread-count")
    public UnreadResponse unreadCount() {
        int cnt = repo.countByReceiverIdAndIsReadFalse(mockUserId());
        return new UnreadResponse(cnt);
    }

    // ==================== DTO ============================
    public static class SendMessageRequest {
        public Long receiverId;
        public Long postId;
        public String content;
    }

    public static class UnreadResponse {
        public int unread;

        public UnreadResponse(int unread) {
            this.unread = unread;
        }
    }
}
