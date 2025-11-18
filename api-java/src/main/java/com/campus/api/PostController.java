package com.campus.api;

import org.springframework.web.bind.annotation.*;

import java.time.Instant;
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

    // JWT 붙기 전까지 임시로 유저 ID 1번으로 고정
    private Long mockUserId() {
        return 1L;
    }

    /**
     * 게시글 생성
     * body: Post(JSON) - title, content 등
     */
    @PostMapping
    public Post create(@RequestBody Post req) {
        req.setUserId(mockUserId());
        return postRepo.save(req);
    }

    /**
     * 게시글 목록
     * -> 간단하게 Post 엔티티 리스트만 반환
     */
    @GetMapping
    public List<Post> list() {
        return postRepo.findAll();
    }

    /**
     * 게시글 상세
     * - 게시글 기본 정보
     * - 작성자 정보(User)
     * - 이 글에 달린 댓글 목록 + 각 댓글 작성자
     *
     * 응답 타입: PostDetailResponse (아래 static class)
     */
    @GetMapping("/{id}")
    public PostDetailResponse get(@PathVariable Long id) {
        Post post = postRepo.findById(id).orElseThrow();

        // 게시글 작성자
        User author = userRepo.findById(post.getUserId())
                .orElseThrow(() -> new RuntimeException("AUTHOR_NOT_FOUND"));

        SimpleUser authorDto = new SimpleUser(author.getId(), author.getEmail(), author.getName());

        // 댓글 목록
        List<Comment> comments = commentRepo.findByPostIdOrderByCreatedAtAsc(id);

        List<CommentDto> commentDtos = comments.stream().map(c -> {
            User commentAuthor = userRepo.findById(c.getUserId())
                    .orElseThrow(() -> new RuntimeException("COMMENT_AUTHOR_NOT_FOUND"));

            SimpleUser commentUserDto =
                    new SimpleUser(commentAuthor.getId(), commentAuthor.getEmail(), commentAuthor.getName());

            return new CommentDto(
                    c.getId(),
                    c.getContent(),
                    c.getCreatedAt(),
                    commentUserDto
            );
        }).collect(Collectors.toList());

        return new PostDetailResponse(
                post.getId(),
                post.getTitle(),
                post.getContent(),
                post.getCreatedAt(),
                authorDto,
                commentDtos
        );
    }

    /**
     * 게시글 수정
     */
    @PatchMapping("/{id}")
    public Post update(@PathVariable Long id, @RequestBody Post req) {
        Post p = postRepo.findById(id).orElseThrow();
        if (!mockUserId().equals(p.getUserId())) {
            throw new RuntimeException("FORBIDDEN");
        }
        p.setTitle(req.getTitle());
        p.setContent(req.getContent());
        p.setUpdatedAt(Instant.now());
        return postRepo.save(p);
    }

    /**
     * 게시글 삭제
     */
    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        Post p = postRepo.findById(id).orElseThrow();
        if (!mockUserId().equals(p.getUserId())) {
            throw new RuntimeException("FORBIDDEN");
        }
        postRepo.deleteById(id);
    }

    /**
     * 댓글 생성
     * 예: POST /posts/1/comments
     * body: { "content": "댓글입니다" }
     */
    @PostMapping("/{postId}/comments")
    public Comment addComment(@PathVariable Long postId,
                              @RequestBody CommentCreateRequest req) {

        // 게시글 존재 여부 확인
        Post post = postRepo.findById(postId)
                .orElseThrow(() -> new RuntimeException("POST_NOT_FOUND"));

        Comment comment = new Comment();
        comment.setPostId(post.getId());
        comment.setUserId(mockUserId());          // 나중에 JWT에서 꺼내서 넣으면 됨
        comment.setContent(req.getContent());
        comment.setCreatedAt(Instant.now());

        return commentRepo.save(comment);
    }

    // ================== 아래는 응답/요청용 DTO 클래스들 ==================

    /**
     * 댓글 생성 요청 body
     */
    public static class CommentCreateRequest {
        private String content;

        public String getContent() {
            return content;
        }

        public void setContent(String content) {
            this.content = content;
        }
    }

    /**
     * 간단한 유저 정보 DTO (id / email / name)
     */
    public static class SimpleUser {
        public Long id;
        public String email;
        public String name;

        public SimpleUser(Long id, String email, String name) {
            this.id = id;
            this.email = email;
            this.name = name;
        }
    }

    /**
     * 댓글 응답 DTO
     */
    public static class CommentDto {
        public Long id;
        public String content;
        public Instant createdAt;
        public SimpleUser author;

        public CommentDto(Long id, String content, Instant createdAt, SimpleUser author) {
            this.id = id;
            this.content = content;
            this.createdAt = createdAt;
            this.author = author;
        }
    }

    /**
     * 게시글 상세 응답 DTO
     * - 게시글 + 작성자 + 댓글 리스트
     */
    public static class PostDetailResponse {
        public Long id;
        public String title;
        public String content;
        public Instant createdAt;
        public SimpleUser author;
        public List<CommentDto> comments;

        public PostDetailResponse(Long id,
                                  String title,
                                  String content,
                                  Instant createdAt,
                                  SimpleUser author,
                                  List<CommentDto> comments) {
            this.id = id;
            this.title = title;
            this.content = content;
            this.createdAt = createdAt;
            this.author = author;
            this.comments = comments;
        }
    }
}
