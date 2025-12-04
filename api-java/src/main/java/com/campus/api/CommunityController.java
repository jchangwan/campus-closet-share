package com.campus.api;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.time.LocalDateTime;
import java.util.Comparator;
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

    // ===== 1) 커뮤니티 글 목록: GET /community/posts =====
    @GetMapping("/posts")
    public List<ListResponse> list(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "latest") String sort
    ) {
        List<CommunityPost> all = postRepo.findAll();

        Comparator<CommunityPost> comparator;
        if ("popular".equalsIgnoreCase(sort)) {
            comparator = Comparator
                    .comparingInt(CommunityPost::getLikeCount)
                    .thenComparing(CommunityPost::getCreatedAt)
                    .reversed();
        } else {
            // latest
            comparator = Comparator.comparing(CommunityPost::getCreatedAt).reversed();
        }

        return all.stream()
                .sorted(comparator)
                .skip((long) page * size)
                .limit(size)
                .map(ListResponse::from)
                .collect(Collectors.toList());
    }

    // ===== 2) 커뮤니티 글 상세: GET /community/posts/{id} =====
    @GetMapping("/posts/{id}")
    public DetailResponse get(@PathVariable Long id) {
        CommunityPost post = postRepo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Community post not found"));

        List<CommunityComment> comments = commentRepo.findByPostOrderByCreatedAtAsc(post);

        return DetailResponse.from(post, comments);
    }

    // ===== 3) 글 작성: POST /community/posts =====
    @PostMapping("/posts")
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

        User author = userRepo.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "User not found"));

        CommunityPost post = new CommunityPost(author, req.title, req.content, req.imageUrls);
        CommunityPost saved = postRepo.save(post);

        return DetailResponse.from(saved, List.of());
    }

    // ===== 4) 글 수정: PATCH /community/posts/{id} =====
    @PatchMapping("/posts/{id}")
    public DetailResponse update(
            @RequestHeader("X-USER-ID") Long userId,
            @PathVariable Long id,
            @RequestBody UpdatePostRequest req
    ) {
        CommunityPost post = postRepo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Community post not found"));

        if (!post.getAuthor().getId().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You can edit only your own post");
        }

        if (req.title != null && !req.title.isBlank()) {
            post.setTitle(req.title);
        }
        if (req.content != null && !req.content.isBlank()) {
            post.setContent(req.content);
        }
        if (req.imageUrls != null) {
            post.setImageUrls(req.imageUrls);
        }

        CommunityPost saved = postRepo.save(post);
        List<CommunityComment> comments = commentRepo.findByPostOrderByCreatedAtAsc(saved);
        return DetailResponse.from(saved, comments);
    }

    // ===== 5) 글 삭제: DELETE /community/posts/{id} =====
    @DeleteMapping("/posts/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(
            @RequestHeader("X-USER-ID") Long userId,
            @PathVariable Long id
    ) {
        CommunityPost post = postRepo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Community post not found"));

        if (!post.getAuthor().getId().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You can delete only your own post");
        }

        commentRepo.deleteAllByPost(post);
        postRepo.delete(post);
    }

    // ===== 6) 좋아요 토글 (단순 카운트 증가 버전): POST /community/posts/{id}/like =====
    @PostMapping("/posts/{id}/like")
    public LikeResponse like(
            @RequestHeader("X-USER-ID") Long userId,
            @PathVariable Long id
    ) {
        CommunityPost post = postRepo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Community post not found"));

        // 간단하게: 누가 눌렀든 항상 +1 (사용자별 토글은 별도 엔티티 필요)
        post.setLikeCount(post.getLikeCount() + 1);
        CommunityPost saved = postRepo.save(post);

        LikeResponse resp = new LikeResponse();
        resp.postId = saved.getId();
        resp.likeCount = saved.getLikeCount();
        resp.liked = true;
        return resp;
    }

    // ===== 7) 댓글 목록: GET /community/posts/{id}/comments =====
    @GetMapping("/posts/{id}/comments")
    public List<CommentDto> listComments(@PathVariable Long id) {
        CommunityPost post = postRepo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Community post not found"));

        return commentRepo.findByPostOrderByCreatedAtAsc(post)
                .stream()
                .map(CommentDto::from)
                .collect(Collectors.toList());
    }

    // ===== 8) 댓글 작성: POST /community/posts/{id}/comments =====
    @PostMapping("/posts/{id}/comments")
    public CommentDto createComment(
            @RequestHeader("X-USER-ID") Long userId,
            @PathVariable Long id,
            @RequestBody CreateCommentRequest req
    ) {
        if (req.content == null || req.content.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "content is required");
        }

        CommunityPost post = postRepo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Community post not found"));

        User author = userRepo.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "User not found"));

        CommunityComment comment = new CommunityComment(post, author, req.content);
        CommunityComment saved = commentRepo.save(comment);

        return CommentDto.from(saved);
    }

    // ===== 9) 댓글 삭제: DELETE /community/comments/{commentId} =====
    @DeleteMapping("/comments/{commentId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteComment(
            @RequestHeader("X-USER-ID") Long userId,
            @PathVariable Long commentId
    ) {
        CommunityComment comment = commentRepo.findById(commentId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Comment not found"));

        if (!comment.getAuthor().getId().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You can delete only your own comment");
        }

        commentRepo.delete(comment);
    }

    // ===== DTO들 =====

    public static class ListResponse {
        public Long id;
        public String title;
        public String content;
        public Instant createdAt;
        public Long authorId;
        public String authorNickname;
        public String profilePic;
        public String thumbnailUrl;
        public int likeCount;

        public static ListResponse from(CommunityPost p) {
            ListResponse r = new ListResponse();
            r.id = p.getId();
            r.title = p.getTitle();
            r.content = p.getContent();
            r.createdAt = p.getCreatedAt();
            r.likeCount = p.getLikeCount();

            User author = p.getAuthor();
            if (author != null) {
                r.authorId = author.getId();
                r.authorNickname = author.getNickname();
                r.profilePic = author.getProfileImageUrl();
            }
            r.thumbnailUrl = p.getThumbnailUrl();
            return r;
        }
    }

    public static class DetailResponse {
        public Long id;
        public String title;
        public String content;
        public Instant createdAt;
        public Instant updatedAt;
        public Long authorId;
        public String authorNickname;
        public String profilePic;
        public List<String> imageUrls;
        public int likeCount;
        public List<CommentDto> comments;

        public static DetailResponse from(CommunityPost p, List<CommunityComment> comments) {
            DetailResponse r = new DetailResponse();
            r.id = p.getId();
            r.title = p.getTitle();
            r.content = p.getContent();
            r.createdAt = p.getCreatedAt();
            r.updatedAt = p.getUpdatedAt();
            r.likeCount = p.getLikeCount();
            r.imageUrls = p.getImageUrls();

            User author = p.getAuthor();
            if (author != null) {
                r.authorId = author.getId();
                r.authorNickname = author.getNickname();
                r.profilePic = author.getProfileImageUrl();
            }

            r.comments = comments.stream()
                    .map(CommentDto::from)
                    .collect(Collectors.toList());
            return r;
        }
    }

    public static class CommentDto {
        public Long id;
        public Long authorId;
        public String authorNickname;
        public String content;
        public LocalDateTime createdAt;

        public static CommentDto from(CommunityComment c) {
            CommentDto r = new CommentDto();
            r.id = c.getId();
            r.authorId = c.getAuthor().getId();
            r.authorNickname = c.getAuthor().getNickname();
            r.content = c.getContent();
            r.createdAt = c.getCreatedAt();
            return r;
        }
    }

    public static class LikeResponse {
        public Long postId;
        public int likeCount;
        public boolean liked;
    }

    public static class CreatePostRequest {
        public String title;
        public String content;
        public List<String> imageUrls;
    }

    public static class UpdatePostRequest {
        public String title;
        public String content;
        public List<String> imageUrls;
    }

    public static class CreateCommentRequest {
        public String content;
    }
}
