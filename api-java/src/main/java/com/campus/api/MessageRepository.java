package com.campus.api.message;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface MessageRepository extends JpaRepository<Message, Long> {

    List<Message> findByReceiverIdOrderByCreatedAtDesc(Long receiverId);
    List<Message> findBySenderIdOrderByCreatedAtDesc(Long senderId);

    int countByReceiverIdAndIsReadFalse(Long receiverId);
}
