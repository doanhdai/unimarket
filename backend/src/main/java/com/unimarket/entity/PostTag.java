package com.unimarket.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "post_tags")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PostTag {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "post_id", nullable = false)
    private ForumPost post;

    @Column(nullable = false, length = 100)
    private String tag;
}
