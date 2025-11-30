package com.campus.api;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CommentRepository extends JpaRepository<Comment, Long> {

    List<Comment> findByPostOrderByCreatedAtAsc(Post post);

    // 게시글 삭제할 때 댓글 전부 같이 지우기 위한 메서드
    void deleteAllByPost(Post post);
}
