package com.campus.api;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
public interface MessageRepository extends JpaRepository<Message, Long> {

    // 받은 쪽지함 (receiver 기준)
    Page<Message> findByReceiverOrderByCreatedAtDesc(User receiver, Pageable pageable);

    // 안 읽은 쪽지 개수
    long countByReceiverAndIsReadIsFalse(User receiver);

    @Query("""
        select m
        from Message m
        where m.post.id = :postId
          and (
                (m.sender.id = :userId and m.receiver.id = :otherUserId)
             or (m.sender.id = :otherUserId and m.receiver.id = :userId)
          )
        order by m.createdAt asc
        """)
    List<Message> findConversation(
            @Param("postId") Long postId,
            @Param("userId") Long userId,
            @Param("otherUserId") Long otherUserId
    );
}
