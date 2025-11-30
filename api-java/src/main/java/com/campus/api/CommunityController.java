package com.campus.api;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/community")
public class CommunityController {

    private final CommunityPostRepository postRepo;
    private final CommunityCommentRepository commentRepo;
    private final UserRepository userRepo;

    public CommunityController(CommunityPostRepository postRepo,
                               CommunityCommentRepository commentRepo,
                               UserRepository userRepo) {
        this.postRepo = postRepo;
        this.commentRepo = commentRepo;
        this.userRepo = userRepo;
    }

    // 아직 인증 안 붙였으니까 임시로 userId = 1 고정
    private Long mockUserId() {
        return 1L;
    }

    // ===== 1) 커뮤니티 글 목록: GET /community/posts?sort=latest|popular =====
    @GetMapping("/posts")
    public List<PostListResponse> list(@RequestParam(defaultValue = "latest") String sort) {
        List<CommunityPost> posts;

        if ("popular".equalsIgnoreCase(sort)) {
            posts = postRepo.findAllByOrderByLikeCountDesc();
        } else {
            posts = postRepo.findAllByOrderByCreatedAtDesc();
        }

        return posts.stream()
                .map(PostListResponse::from)
                .collect(Collectors.toList());
    }

    // ===== 2) 글 상세: GET /community/posts/{id} =====
    @GetMapping("/posts/{id}")
    public PostDetailResponse get(@PathVariable Long id) {
        CommunityPost post = postRepo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Community post not found"));

        List<CommunityComment> comments = commentRepo.findByPostOrderByCreatedAtAsc(post);

        return PostDetailResponse.from(post, comments);
    }

    // ===== 3) 글 작성: POST /community/posts =====
    @PostMapping("/posts")
    public PostDetailResponse create(@RequestBody CreatePostRequest req) {
        Long userId = mockUserId();

        if (req.title == null || req.title.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "title is required");
        }
        if (req.content == null || req.content.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "content is required");
        }

        User author = userRepo.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Author user not found"));

        CommunityPost post = new CommunityPost(
                author,
                req.title,
                req.content,
                req.thumbnailUrl
        );
        CommunityPost saved = postRepo.save(post);

        return PostDetailResponse.from(saved, List.of());
    }

    // ===== 4) 글 수정: PATCH /community/posts/{id} =====
    @PatchMapping("/posts/{id}")
    public PostDetailResponse update(@PathVariable Long id,
                                     @RequestBody UpdatePostRequest req) {

        Long userId = mockUserId();

        CommunityPost post = postRepo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Community post not found"));
        // 작성자만 수정 가능
        if (!post.getAuthor().getId().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You can edit only your own community post");
        }
        if (req.title != null && !req.title.isBlank()) {
            post.setTitle(req.title);
        }
        if (req.content != null && !req.content.isBlank()) {
            post.setContent(req.content);
        }
        if (req.thumbnailUrl != null) {
            post.setThumbnailUrl(req.thumbnailUrl);
        }

        CommunityPost saved = postRepo.save(post);
        List<CommunityComment> comments = commentRepo.findByPostOrderByCreatedAtAsc(saved);

        return PostDetailResponse.from(saved, comments);
    }

    // ===== 5) 글 삭제: DELETE /community/posts/{id} =====
    @DeleteMapping("/posts/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        Long userId = mockUserId();

        CommunityPost post = postRepo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Community post not found"));

        // 작성자만 삭제 가능
        if (!post.getAuthor().getId().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You can delete only your own community post");
        }

        commentRepo.deleteAllByPost(post);
        postRepo.delete(post);
    }


    // ===== 6) 좋아요 증가: POST /community/posts/{id}/like =====
    @PostMapping("/posts/{id}/like")
    public LikeResponse like(@PathVariable Long id) {
        CommunityPost post = postRepo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Community post not found"));

        // 간단 버전: 누르면 무조건 +1
        post.setLikeCount(post.getLikeCount() + 1);
        CommunityPost saved = postRepo.save(post);

        LikeResponse res = new LikeResponse();
        res.postId = saved.getId();
        res.likeCount = saved.getLikeCount();
        return res;
    }

    // ===== 7) 댓글 목록: GET /community/posts/{postId}/comments =====
    @GetMapping("/posts/{postId}/comments")
    public List<CommentResponse> listComments(@PathVariable Long postId) {
        CommunityPost post = postRepo.findById(postId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Community post not found"));

        List<CommunityComment> comments = commentRepo.findByPostOrderByCreatedAtAsc(post);
        return comments.stream()
                .map(CommentResponse::from)
                .collect(Collectors.toList());
    }

    // ===== 8) 댓글 작성: POST /community/posts/{postId}/comments =====
    @PostMapping("/posts/{postId}/comments")
    public CommentResponse addComment(@PathVariable Long postId,
                                      @RequestBody CreateCommentRequest req) {
        Long userId = mockUserId();

        if (req.content == null || req.content.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "content is required");
        }

        CommunityPost post = postRepo.findById(postId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Community post not found"));

        User author = userRepo.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Author user not found"));

        CommunityComment comment = new CommunityComment(post, author, req.content);
        CommunityComment saved = commentRepo.save(comment);

        // 댓글 수 갱신
        post.setCommentCount(post.getCommentCount() + 1);
        postRepo.save(post);

        return CommentResponse.from(saved);
    }

    // ===== 9) 댓글 삭제: DELETE /community/comments/{commentId} =====
    @DeleteMapping("/comments/{commentId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteComment(@PathVariable Long commentId) {
        Long userId = mockUserId();

        CommunityComment comment = commentRepo.findById(commentId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Comment not found"));

        // 댓글 작성자만 삭제 가능
        if (!comment.getAuthor().getId().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You can delete only your own comment");
        }

        CommunityPost post = comment.getPost();

        commentRepo.delete(comment);

        int newCount = Math.max(0, post.getCommentCount() - 1);
        post.setCommentCount(newCount);
        postRepo.save(post);
    }


    // ===== DTO 들 =====

    // 목록용 DTO
    public static class PostListResponse {
        public Long id;
        public Long authorId;
        public String authorNickname;
        public String title;
        public String content;
        public String thumbnailUrl;
        public int likeCount;
        public int commentCount;
        public java.time.Instant createdAt;

        public static PostListResponse from(CommunityPost p) {
            PostListResponse r = new PostListResponse();
            r.id = p.getId();
            r.authorId = p.getAuthor().getId();
            r.authorNickname = p.getAuthor().getNickname();
            r.title = p.getTitle();
            r.content = p.getContent();
            r.thumbnailUrl = p.getThumbnailUrl();
            r.likeCount = p.getLikeCount();
            r.commentCount = p.getCommentCount();
            r.createdAt = p.getCreatedAt();
            return r;
        }
    }

    // 상세용 DTO
    public static class PostDetailResponse {
        public Long id;
        public Long authorId;
        public String authorNickname;
        public String title;
        public String content;
        public String thumbnailUrl;
        public int likeCount;
        public int commentCount;
        public java.time.Instant createdAt;
        public java.time.Instant updatedAt;
        public List<CommentResponse> comments;

        public static PostDetailResponse from(CommunityPost p, List<CommunityComment> comments) {
            PostDetailResponse r = new PostDetailResponse();
            r.id = p.getId();
            r.authorId = p.getAuthor().getId();
            r.authorNickname = p.getAuthor().getNickname();
            r.title = p.getTitle();
            r.content = p.getContent();
            r.thumbnailUrl = p.getThumbnailUrl();
            r.likeCount = p.getLikeCount();
            r.commentCount = p.getCommentCount();
            r.createdAt = p.getCreatedAt();
            r.updatedAt = p.getUpdatedAt();
            r.comments = comments.stream()
                    .map(CommentResponse::from)
                    .collect(Collectors.toList());
            return r;
        }
    }

    // 댓글 응답 DTO
    public static class CommentResponse {
        public Long id;
        public Long authorId;
        public String authorNickname;
        public String content;
        public LocalDateTime createdAt;

        public static CommentResponse from(CommunityComment c) {
            CommentResponse r = new CommentResponse();
            r.id = c.getId();
            r.authorId = c.getAuthor().getId();
            r.authorNickname = c.getAuthor().getNickname();
            r.content = c.getContent();
            r.createdAt = c.getCreatedAt();
            return r;
        }
    }

    // 좋아요 응답 DTO
    public static class LikeResponse {
        public Long postId;
        public int likeCount;
    }

    // 글 생성 요청 DTO
    public static class CreatePostRequest {
        public String title;
        public String content;
        public String thumbnailUrl;
    }

    // 글 수정 요청 DTO
    public static class UpdatePostRequest {
        public String title;
        public String content;
        public String thumbnailUrl;
    }

    // 댓글 생성 요청 DTO
    public static class CreateCommentRequest {
        public String content;
    }
}
