package com.campus.api;

import org.springframework.web.bind.annotation.*;
import java.time.Instant;
import java.util.List;
import java.util.Optional;

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

    // TODO: 나중에 JWT 붙이면 여기서 유저 ID 뽑아서 쓰면 됨
    private Long mockUserId() {
        return 1L;
    }

    // ========= 1) 게시글 생성 =========
    @PostMapping
    public Post create(@RequestBody Post req) {
        req.setUserId(mockUserId());
        req.setUpdatedAt(Instant.now());
        return postRepo.save(req);
    }

    // ========= 2) 게시글 목록 (단순 버전, 나중에 page / size 추가 가능) =========
    @GetMapping
    public List<Post> list() {
        // 최신 순으로 보고 싶으면 PostRepository 에 정렬 쿼리 추가해도 됨
        return postRepo.findAll();
    }

    // ========= 3) 게시글 단순 조회 (엔티티 그대로) =========
    @GetMapping("/{id}/raw")
    public Post getRaw(@PathVariable Long id) {
        return postRepo.findById(id).orElseThrow();
    }

    // ========= 4) 게시글 상세 조회 + 댓글 목록 =========
    @GetMapping("/{id}")
    public PostDetailResponse detail(@PathVariable Long id) {
        Post post = postRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("POST_NOT_FOUND"));

        List<Comment> comments = commentRepo.findByPostIdOrderByCreatedAtAsc(id);

        // 작성자
        SimpleUser author = userRepo.findById(post.getUserId())
                .map(SimpleUser::new)
                .orElseGet(() -> new SimpleUser(null, "unknown", "unknown"));

        // 댓글 DTO 변환
        List<CommentDto> commentDtos = comments.stream()
                .map(c -> {
                    SimpleUser commentAuthor = userRepo.findById(c.getUserId())
                            .map(SimpleUser::new)
                            .orElseGet(() -> new SimpleUser(null, "unknown", "unknown"));
                    return new CommentDto(c, commentAuthor);
                })
                .toList();

        return new PostDetailResponse(post, author, commentDtos);
    }

    // ========= 5) 게시글 수정 =========
    @PatchMapping("/{id}")
    public Post update(@PathVariable Long id, @RequestBody Post req) {
        Post p = postRepo.findById(id).orElseThrow();

        if (!mockUserId().equals(p.getUserId())) {
            throw new RuntimeException("FORBIDDEN");
        }

        // 수정 가능한 필드만 교체
        if (req.getTitle() != null) p.setTitle(req.getTitle());
        if (req.getContent() != null) p.setContent(req.getContent());
        if (req.getPrice() != null) p.setPrice(req.getPrice());
        if (req.getSize() != null) p.setSize(req.getSize());
        if (req.getImageUrl() != null) p.setImageUrl(req.getImageUrl());

        p.setUpdatedAt(Instant.now());
        return postRepo.save(p);
    }

    // ========= 6) 게시글 삭제 =========
    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        Post p = postRepo.findById(id).orElseThrow();

        if (!mockUserId().equals(p.getUserId())) {
            throw new RuntimeException("FORBIDDEN");
        }

        postRepo.deleteById(id);
    }

    // ========= 7) 댓글 생성 =========
    @PostMapping("/{postId}/comments")
    public Comment addComment(@PathVariable Long postId,
                              @RequestBody CommentCreateRequest req) {

        Post post = postRepo.findById(postId)
                .orElseThrow(() -> new RuntimeException("POST_NOT_FOUND"));

        Comment comment = new Comment();
        comment.setPostId(post.getId());
        comment.setUserId(mockUserId());  // 나중에 JWT 붙이면 여기서 가져오기
        comment.setContent(req.content);
        comment.setCreatedAt(Instant.now());

        return commentRepo.save(comment);
    }

    // ================== 내부 DTO들 ==================

    /** 댓글 생성용 요청 바디 */
    public static class CommentCreateRequest {
        public String content;
    }

    /** 유저 정보 축약 형태 (id, email, name 정도만) */
    public static class SimpleUser {
        public Long id;
        public String email;
        public String name;

        public SimpleUser(User u) {
            this.id = u.getId();
            this.email = u.getEmail();
            this.name = u.getName();
        }

        public SimpleUser(Long id, String email, String name) {
            this.id = id;
            this.email = email;
            this.name = name;
        }
    }

    /** 댓글 응답 DTO */
    public static class CommentDto {
        public Long id;
        public String content;
        public Instant createdAt;
        public SimpleUser author;

        public CommentDto(Comment c, SimpleUser author) {
            this.id = c.getId();
            this.content = c.getContent();
            this.createdAt = c.getCreatedAt();
            this.author = author;
        }
    }

    /** 게시글 + 작성자 + 댓글까지 한 번에 내려줄 DTO */
    public static class PostDetailResponse {
        public Long id;
        public String title;
        public String content;
        public Integer price;
        public String size;
        public String imageUrl;
        public Instant createdAt;
        public SimpleUser author;
        public List<CommentDto> comments;

        public PostDetailResponse(Post post,
                                  SimpleUser author,
                                  List<CommentDto> comments) {
            this.id = post.getId();
            this.title = post.getTitle();
            this.content = post.getContent();
            this.price = post.getPrice();
            this.size = post.getSize();
            this.imageUrl = post.getImageUrl();
            this.createdAt = post.getCreatedAt();
            this.author = author;
            this.comments = comments;
        }
    }
}
