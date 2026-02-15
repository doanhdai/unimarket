package com.unimarket.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "files")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ForumFile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "original_name", nullable = false)
    private String originalName;

    @Column(name = "file_type", nullable = false)
    private String fileType;

    @Column(name = "file_size")
    private Long fileSize;

    @Column(name = "file_path", nullable = false, length = 1000)
    private String filePath;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
