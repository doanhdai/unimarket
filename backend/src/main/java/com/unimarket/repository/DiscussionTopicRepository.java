package com.unimarket.repository;

import com.unimarket.entity.DiscussionTopic;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DiscussionTopicRepository extends JpaRepository<DiscussionTopic, Long> {
    List<DiscussionTopic> findAllByOrderByTitleAsc();
}
