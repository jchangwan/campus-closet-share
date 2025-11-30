package com.campus.api;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CommunityCommentRepository extends JpaRepository<CommunityComment, Long> {

    // 특정 게시글의 댓글들을 시간순으로
    List<CommunityComment> findByPostOrderByCreatedAtAsc(CommunityPost post);

    // 게시글 삭제 전에 댓글 싹 지울 때 사용
    void deleteAllByPost(CommunityPost post);
}
