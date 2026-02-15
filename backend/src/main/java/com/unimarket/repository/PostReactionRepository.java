package com.unimarket.repository;

import com.unimarket.entity.PostReaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface PostReactionRepository extends JpaRepository<PostReaction, Long> {
    Optional<PostReaction> findByPostIdAndUserId(Long postId, Long userId);

    List<PostReaction> findByPostId(Long postId);

    long countByPostId(Long postId);

    void deleteByPostIdAndUserId(Long postId, Long userId);

    @Query("SELECT r.reactionType, COUNT(r) FROM PostReaction r WHERE r.post.id = :postId GROUP BY r.reactionType")
    List<Object[]> countByPostIdGroupByType(Long postId);
}
