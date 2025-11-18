package com.campus.api;
import jakarta.persistence.*;
import java.time.Instant;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.JoinColumn;

@ManyToOne(optional = false)
@JoinColumn(name = "author_id")
private User author;


@Entity
@Table(name = "posts")
public class Post {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable=false) private String title;
    @Lob @Column(nullable=false) private String content;
    private Long userId;                 // 작성자 (JWT 붙기 전까지 임시)

    @Column(nullable=false) private Instant createdAt = Instant.now();
    private Instant updatedAt;

    // getter/setter
    public Long getId(){ return id; }
    public String getTitle(){ return title; }
    public void setTitle(String title){ this.title = title; }
    public String getContent(){ return content; }
    public void setContent(String content){ this.content = content; }
    public Long getUserId(){ return userId; }
    public void setUserId(Long userId){ this.userId = userId; }
    public Instant getCreatedAt(){ return createdAt; }
    public Instant getUpdatedAt(){ return updatedAt; }
    public void setUpdatedAt(Instant t){ this.updatedAt = t; }
    public User getAuthor() { return author; }
    public void setAuthor(User author) { this.author = author; }
}
