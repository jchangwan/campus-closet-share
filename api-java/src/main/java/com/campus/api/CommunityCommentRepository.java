package com.campus.api;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CommunityCommentRepository extends JpaRepository<CommunityComment, Long> {

    List<CommunityComment> findByPostOrderByCreatedAtAsc(CommunityPost post);

    void deleteAllByPost(CommunityPost post);
}
