package com.campus.api.message;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "messages")
public class Message {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long senderId;
    private Long receiverId;

    private Long postId;          // 어떤 게시글 보고 보냈는지 Optional

    private String content;

    private Instant createdAt = Instant.now();

    private boolean isRead = false;

    public Message() {}

    public Message(Long senderId, Long receiverId, Long postId, String content) {
        this.senderId = senderId;
        this.receiverId = receiverId;
        this.postId = postId;
        this.content = content;
        this.createdAt = Instant.now();
        this.isRead = false;
    }

    // Getter/Setter
    public Long getId() { return id; }
    public Long getSenderId() { return senderId; }
    public Long getReceiverId() { return receiverId; }
    public Long getPostId() { return postId; }
    public String getContent() { return content; }
    public Instant getCreatedAt() { return createdAt; }
    public boolean isRead() { return isRead; }

    public void setRead(boolean read) { isRead = read; }
}
