package com.unimarket.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "comment_files")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CommentFile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "comment_id", nullable = false)
    private Comment comment;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "file_id", nullable = false)
    private ForumFile file;
}
