package com.campus.api;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/posts")
public class PostController {

    private final PostRepository postRepo;
    private final CommentRepository commentRepo;
    private final UserRepository userRepo;

    public PostController(PostRepository postRepo,
                          CommentRepository commentRepo,
                          UserRepository userRepo) {
        this.postRepo = postRepo;
        this.commentRepo = commentRepo;
        this.userRepo = userRepo;
    }

    // ===== 1) 게시글 목록 조회: GET /posts =====
    @GetMapping
    public List<ListResponse> list() {
        return postRepo.findAll()
                .stream()
                .map(ListResponse::from)
                .collect(Collectors.toList());
    }

    // ===== 2) 게시글 상세 조회: GET /posts/{id} =====
    @GetMapping("/{id}")
    public DetailResponse get(@PathVariable Long id) {
        Post post = postRepo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Post not found"));

        User author = userRepo.findById(post.getUserId())
                .orElse(null);

        SimpleUser authorDto = author != null
                ? SimpleUser.from(author)
                : null;

        List<Comment> comments = commentRepo.findByPostOrderByCreatedAtAsc(post);
        List<CommentDto> commentDtos = comments.stream()
                .map(CommentDto::from)
                .collect(Collectors.toList());

        return new DetailResponse(
                post.getId(),
                post.getTitle(),
                post.getContent(),
                post.getImageUrl(),
                post.getCreatedAt(),
                post.getUpdatedAt(),
                authorDto,
                commentDtos
        );
    }

    // ===== 3) 게시글 작성: POST /posts =====
    @PostMapping
    public DetailResponse create(
            @RequestHeader("X-USER-ID") Long userId,
            @RequestBody CreatePostRequest req
    ) {
        if (req.title == null || req.title.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "title is required");
        }
        if (req.content == null || req.content.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "content is required");
        }

        // imageUrl 은 프론트에서 FileController 등을 통해 먼저 업로드 후 URL을 넘겨주는 방식
        Post post = new Post(
                userId,
                req.title,
                req.content,
                req.imageUrl
        );
        Post saved = postRepo.save(post);

        User author = userRepo.findById(userId).orElse(null);
        SimpleUser authorDto = author != null ? SimpleUser.from(author) : null;

        return new DetailResponse(
                saved.getId(),
                saved.getTitle(),
                saved.getContent(),
                saved.getImageUrl(),
                saved.getCreatedAt(),
                saved.getUpdatedAt(),
                authorDto,
                List.of()
        );
    }

    // ===== 4) 게시글 수정: PUT /posts/{id} =====
    @PutMapping("/{id}")
    public DetailResponse update(
            @RequestHeader("X-USER-ID") Long userId,
            @PathVariable Long id,
            @RequestBody UpdatePostRequest req
    ) {

        Post post = postRepo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Post not found"));

        // 작성자만 수정 가능
        if (!post.getUserId().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You can edit only your own post");
        }

        if (req.title != null && !req.title.isBlank()) {
            post.setTitle(req.title);
        }
        if (req.content != null && !req.content.isBlank()) {
            post.setContent(req.content);
        }
        if (req.imageUrl != null) {
            post.setImageUrl(req.imageUrl);
        }

        Post saved = postRepo.save(post);
        User author = userRepo.findById(saved.getUserId()).orElse(null);
        SimpleUser authorDto = author != null ? SimpleUser.from(author) : null;
        List<Comment> comments = commentRepo.findByPostOrderByCreatedAtAsc(saved);
        List<CommentDto> commentDtos = comments.stream()
                .map(CommentDto::from)
                .collect(Collectors.toList());

        return new DetailResponse(
                saved.getId(),
                saved.getTitle(),
                saved.getContent(),
                saved.getImageUrl(),
                saved.getCreatedAt(),
                saved.getUpdatedAt(),
                authorDto,
                commentDtos
        );
    }

    // ===== 5) 게시글 삭제: DELETE /posts/{id} =====
    @DeleteMapping("/{id}")
    @Transactional
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(
            @RequestHeader("X-USER-ID") Long userId,
            @PathVariable Long id
    ) {
        Post post = postRepo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Post not found"));

        // 작성자만 삭제 가능
        if (!post.getUserId().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You can delete only your own post");
        }

        // 먼저 댓글 모두 삭제
        commentRepo.deleteAllByPost(post);
        // 그 다음 게시글 삭제
        postRepo.delete(post);
    }

    // ===== 6) 댓글 삭제: DELETE /posts/comments/{commentId} =====
    @DeleteMapping("/comments/{commentId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteComment(
            @RequestHeader("X-USER-ID") Long userId,
            @PathVariable Long commentId
    ) {
        Comment comment = commentRepo.findById(commentId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Comment not found"));

        if (!comment.getAuthor().getId().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You can delete only your own comment");
        }

        commentRepo.delete(comment);
    }
    // ===== 7) 댓글 작성: POST /posts/{id}/comments =====
    @PostMapping("/{id}/comments")
    public CommentDto createComment(
            @RequestHeader("X-USER-ID") Long userId,
            @PathVariable Long id,
            @RequestBody CreateCommentRequest req
    ) {
        if (req.content == null || req.content.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "content is required");
        }

        Post post = postRepo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Post not found"));

        User author = userRepo.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "User not found"));

        Comment comment = new Comment(post, author, req.content);
        Comment saved = commentRepo.save(comment);

        return CommentDto.from(saved);
    }

    // ===== DTO =====
    public static class CreateCommentRequest {
        public String content;
    }

    // ====== DTO들 ======

    public static class ListResponse {
        public Long id;
        public String title;
        public String content;
        public String imageUrl;
        public Instant createdAt;

        public static ListResponse from(Post p) {
            ListResponse r = new ListResponse();
            r.id = p.getId();
            r.title = p.getTitle();
            r.content = p.getContent();
            r.imageUrl = p.getImageUrl();
            r.createdAt = p.getCreatedAt();
            return r;
        }
    }

    public static class DetailResponse {
        public Long id;
        public String title;
        public String content;
        public String imageUrl;
        public Instant createdAt;
        public Instant updatedAt;
        public SimpleUser author;
        public List<CommentDto> comments;

        public DetailResponse(Long id,
                              String title,
                              String content,
                              String imageUrl,
                              Instant createdAt,
                              Instant updatedAt,
                              SimpleUser author,
                              List<CommentDto> comments) {
            this.id = id;
            this.title = title;
            this.content = content;
            this.imageUrl = imageUrl;
            this.createdAt = createdAt;
            this.updatedAt = updatedAt;
            this.author = author;
            this.comments = comments;
        }
    }

    public static class SimpleUser {
        public Long id;
        public String nickname;
        public String profileImageUrl;

        public static SimpleUser from(User u) {
            SimpleUser r = new SimpleUser();
            r.id = u.getId();
            r.nickname = u.getNickname();
            r.profileImageUrl = u.getProfileImageUrl();
            return r;
        }
    }

    public static class CommentDto {
        public Long id;
        public Long authorId;
        public String authorNickname;
        public String content;
        public LocalDateTime createdAt;

        public static CommentDto from(Comment c) {
            CommentDto r = new CommentDto();
            r.id = c.getId();
            r.authorId = c.getAuthor().getId();
            r.authorNickname = c.getAuthor().getNickname();
            r.content = c.getContent();
            r.createdAt = c.getCreatedAt();
            return r;
        }
    }

    public static class CreatePostRequest {
        public String title;
        public String content;
        public String imageUrl; // 이미지 업로드 후 URL
    }

    public static class UpdatePostRequest {
        public String title;
        public String content;
        public String imageUrl;
    }
}
