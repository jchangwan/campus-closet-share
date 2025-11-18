package com.campus.api;

import java.time.LocalDateTime;
import java.util.List;

public class PostDetailResponse {

    public static class UserDto {
        public Long id;
        public String email;
        public String name;

        public UserDto(User u) {
            this.id = u.getId();
            this.email = u.getEmail();
            this.name = u.getName();
        }
    }

    public static class CommentDto {
        public Long id;
        public String content;
        public LocalDateTime createdAt;
        public UserDto author;

        public CommentDto(Comment c) {
            this.id = c.getId();
            this.content = c.getContent();
            this.createdAt = c.getCreatedAt();
            this.author = new UserDto(c.getAuthor());
        }
    }

    public Long id;
    public String title;
    public String content;
    public LocalDateTime createdAt;
    public UserDto author;
    public List<CommentDto> comments;

    public PostDetailResponse(Post post, List<Comment> commentList) {
        this.id = post.getId();
        this.title = post.getTitle();      // Post에 getTitle(), getContent() 있다고 가정
        this.content = post.getContent();
        this.createdAt = post.getCreatedAt();
        this.author = new UserDto(post.getAuthor());
        this.comments = commentList.stream()
                .map(CommentDto::new)
                .toList();
    }
}
