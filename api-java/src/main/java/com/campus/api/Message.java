package com.campus.api;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "messages")
public class Message {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 보낸 사람 / 받는 사람 (나중에 User 엔티티와 연관관계 맺어도 되고, 지금은 Id만 사용)
    @Column(nullable = false)
    private Long senderId;

    @Column(nullable = false)
    private Long receiverId;

    // 어떤 게시글을 보고 보낸 메시지인지 (선택)
    private Long postId;

    @Column(nullable = false, length = 1000)
    private String content;

    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    @Column(nullable = false)
    private boolean isRead = false;

    @PrePersist
    public void onCreate() {
        if (createdAt == null) {
            createdAt = Instant.now();
        }
    }

    // === 기본 생성자 ===
    protected Message() {
    }

    // 필요하면 생성자 추가해서 사용 가능
    public Message(Long senderId, Long receiverId, Long postId, String content) {
        this.senderId = senderId;
        this.receiverId = receiverId;
        this.postId = postId;
        this.content = content;
        this.isRead = false;
    }

    // === Getter / Setter ===

    public Long getId() {
        return id;
    }

    public Long getSenderId() {
        return senderId;
    }

    public void setSenderId(Long senderId) {
        this.senderId = senderId;
    }

    public Long getReceiverId() {
        return receiverId;
    }

    public void setReceiverId(Long receiverId) {
        this.receiverId = receiverId;
    }

    public Long getPostId() {
        return postId;
    }

    public void setPostId(Long postId) {
        this.postId = postId;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public boolean isRead() {
        return isRead;
    }

    public void setRead(boolean read) {
        isRead = read;
    }
}
