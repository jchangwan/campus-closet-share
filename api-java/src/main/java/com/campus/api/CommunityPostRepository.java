package com.campus.api;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CommunityPostRepository extends JpaRepository<CommunityPost, Long> {

    // 최신순
    List<CommunityPost> findAllByOrderByCreatedAtDesc();

    // 인기순 (좋아요 많은 순)
    List<CommunityPost> findAllByOrderByLikeCountDesc();
}
