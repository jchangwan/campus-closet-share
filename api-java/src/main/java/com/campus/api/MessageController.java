package com.campus.api;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/messages")
public class MessageController {

    private final MessageRepository repo;

    public MessageController(MessageRepository repo) {
        this.repo = repo;
    }

    // 로그인 붙기 전까지는 임시로 userId = 1 고정
    private Long mockUserId() {
        return 1L;
    }

    // 받은 메시지함 (inbox)
    @GetMapping("/inbox")
    public List<Message> inbox() {
        Long userId = mockUserId();
        return repo.findByReceiverIdOrderByCreatedAtDesc(userId);
    }

    // 보낸 메시지함 (sent)
    @GetMapping("/sent")
    public List<Message> sent() {
        Long userId = mockUserId();
        return repo.findBySenderIdOrderByCreatedAtDesc(userId);
    }

    // 읽지 않은 메시지 개수
    @GetMapping("/unread-count")
    public UnreadResponse unreadCount() {
        Long userId = mockUserId();
        int count = repo.countByReceiverIdAndIsReadFalse(userId);
        return new UnreadResponse(count);
    }

    // 메시지 보내기
    @PostMapping
    public Message send(@RequestBody SendMessageRequest req) {
        Long senderId = mockUserId();

        Message m = new Message();
        m.setSenderId(senderId);
        m.setReceiverId(req.receiverId);
        m.setPostId(req.postId);
        m.setContent(req.content);

        return repo.save(m);
    }

    // ===== 새로 추가: 메시지 삭제 =====
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        Long userId = mockUserId();

        Message m = repo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Message not found"));

        // 보낸 사람이나 받은 사람 둘 중 하나만 삭제 가능
        if (!m.getSenderId().equals(userId) && !m.getReceiverId().equals(userId)) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "You can delete only your own messages"
            );
        }

        repo.delete(m);
    }

    // ==== 요청/응답 DTO ====

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
