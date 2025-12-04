package com.campus.api;

import jakarta.persistence.*;

import java.time.Instant;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

@Entity
@Table(name = "community_posts")
public class CommunityPost {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 작성자
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "author_id")
    private User author;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(nullable = false, length = 4000)
    private String content;

    /**
     * 이미지 여러 개를 지원하기 위해
     * "url1,url2,..." 형태로 직렬화해서 저장
     */
    @Column(name = "image_urls", length = 4000)
    private String imageUrlsSerialized;

    @Column(nullable = false)
    private int likeCount = 0;

    // 🔽🔽🔽 여기 추가된 부분 🔽🔽🔽
    @Column(name = "comment_count", nullable = false)
    private int commentCount = 0;
    // 🔼🔼🔼 여기까지 추가 🔼🔼🔼

    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    @Column(nullable = false)
    private Instant updatedAt;

    // ===== 라이프사이클 =====
    @PrePersist
    public void onCreate() {
        Instant now = Instant.now();
        this.createdAt = now;
        this.updatedAt = now;

        // 안전하게 초기값 보장
        if (this.commentCount < 0) {
            this.commentCount = 0;
        }
        if (this.likeCount < 0) {
            this.likeCount = 0;
        }
    }

    @PreUpdate
    public void onUpdate() {
        this.updatedAt = Instant.now();
    }

    // ===== 생성자 =====
    protected CommunityPost() {
        // JPA 기본 생성자
    }

    public CommunityPost(User author, String title, String content, List<String> imageUrls) {
        this.author = author;
        this.title = title;
        this.content = content;
        setImageUrls(imageUrls);
        this.likeCount = 0;
        this.commentCount = 0;
    }

    // ===== 편의 메서드 =====
    public List<String> getImageUrls() {
        if (imageUrlsSerialized == null || imageUrlsSerialized.isBlank()) {
            return new ArrayList<>();
        }
        return new ArrayList<>(Arrays.asList(imageUrlsSerialized.split(",")));
    }

    public void setImageUrls(List<String> urls) {
        if (urls == null || urls.isEmpty()) {
            this.imageUrlsSerialized = null;
        } else {
            // , 로 join (간단한 방식)
            this.imageUrlsSerialized = String.join(",", urls);
        }
    }

    // 첫 번째 이미지를 썸네일로 쓰고 싶을 때
    public String getThumbnailUrl() {
        List<String> urls = getImageUrls();
        return urls.isEmpty() ? null : urls.get(0);
    }

    // ===== Getter / Setter =====

    public Long getId() {
        return id;
    }

    public User getAuthor() {
        return author;
    }

    public void setAuthor(User author) {
        this.author = author;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public String getImageUrlsSerialized() {
        return imageUrlsSerialized;
    }

    public void setImageUrlsSerialized(String imageUrlsSerialized) {
        this.imageUrlsSerialized = imageUrlsSerialized;
    }

    public int getLikeCount() {
        return likeCount;
    }

    public void setLikeCount(int likeCount) {
        this.likeCount = likeCount;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    // 🔽 commentCount getter/setter 추가 🔽
    public int getCommentCount() {
        return commentCount;
    }

    public void setCommentCount(int commentCount) {
        this.commentCount = commentCount;
    }
    //
}
