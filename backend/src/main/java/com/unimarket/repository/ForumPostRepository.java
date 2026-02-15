package com.unimarket.repository;

import com.unimarket.entity.ForumPost;
import com.unimarket.entity.PostType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface ForumPostRepository extends JpaRepository<ForumPost, Long> {
    Page<ForumPost> findAllByOrderByCreatedAtDesc(Pageable pageable);

    Page<ForumPost> findByPostTypeOrderByCreatedAtDesc(PostType postType, Pageable pageable);

    Page<ForumPost> findByTopicIdOrderByCreatedAtDesc(Long topicId, Pageable pageable);

    @Query("SELECT p FROM ForumPost p WHERE p.author.id = :authorId ORDER BY p.createdAt DESC")
    Page<ForumPost> findByAuthorIdOrderByCreatedAtDesc(@Param("authorId") Long authorId, Pageable pageable);

    @Query("SELECT p FROM ForumPost p WHERE p.title LIKE %:keyword% OR p.content LIKE %:keyword% ORDER BY p.createdAt DESC")
    Page<ForumPost> searchByKeyword(@Param("keyword") String keyword, Pageable pageable);

    Page<ForumPost> findByIsReportedTrueOrderByCreatedAtDesc(Pageable pageable);
}
