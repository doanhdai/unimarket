package com.unimarket.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "post_files")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PostFile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "post_id", nullable = false)
    private ForumPost post;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "file_id", nullable = false)
    private ForumFile file;
}
