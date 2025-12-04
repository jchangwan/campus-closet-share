package com.campus.api;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "community_comments")
public class CommunityComment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 어떤 커뮤니티 글에 달린 댓글인지
    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "post_id")
    private CommunityPost post;

    // 댓글 작성자
    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "author_id")
    private User author;

    @Column(nullable = false, length = 1000)
    private String content;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    // ===== 라이프사이클 =====
    @PrePersist
    public void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }

    // ===== 생성자 =====
    protected CommunityComment() {
        // JPA 기본 생성자
    }

    public CommunityComment(CommunityPost post, User author, String content) {
        this.post = post;
        this.author = author;
        this.content = content;
    }

    // ===== Getter / Setter =====

    public Long getId() {
        return id;
    }

    public CommunityPost getPost() {
        return post;
    }

    public void setPost(CommunityPost post) {
        this.post = post;
    }

    public User getAuthor() {
        return author;
    }

    public void setAuthor(User author) {
        this.author = author;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}
