package com.unimarket.dto.response;

import com.unimarket.entity.*;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Data
@Builder
public class ForumPostResponse {
    private Long id;
    private String title;
    private String content;
    private Long authorId;
    private String authorName;
    private String authorAvatar;
    private Integer viewCount;
    private String postType;
    private Long topicId;
    private String topicTitle;
    private Boolean isReported;
    private List<String> tags;
    private List<FileResponse> files;
    private Map<String, Long> reactionCounts;
    private String userReaction;
    private Long commentCount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @Data
    @Builder
    public static class FileResponse {
        private Long id;
        private String originalName;
        private String fileType;
        private Long fileSize;
        private String filePath;
    }

    public static ForumPostResponse fromPost(ForumPost post, Map<String, Long> reactionCounts, String userReaction,
            long commentCount) {
        return ForumPostResponse.builder()
                .id(post.getId())
                .title(post.getTitle())
                .content(post.getContent())
                .authorId(post.getAuthor().getId())
                .authorName(post.getAuthor().getFullName())
                .authorAvatar(post.getAuthor().getAvatar())
                .viewCount(post.getViewCount())
                .postType(post.getPostType().name())
                .topicId(post.getTopic() != null ? post.getTopic().getId() : null)
                .topicTitle(post.getTopic() != null ? post.getTopic().getTitle() : null)
                .isReported(post.getIsReported())
                .tags(post.getTags().stream().map(PostTag::getTag).collect(Collectors.toList()))
                .files(post.getFiles().stream().map(pf -> FileResponse.builder()
                        .id(pf.getFile().getId())
                        .originalName(pf.getFile().getOriginalName())
                        .fileType(pf.getFile().getFileType())
                        .fileSize(pf.getFile().getFileSize())
                        .filePath(pf.getFile().getFilePath())
                        .build()).collect(Collectors.toList()))
                .reactionCounts(reactionCounts)
                .userReaction(userReaction)
                .commentCount(commentCount)
                .createdAt(post.getCreatedAt())
                .updatedAt(post.getUpdatedAt())
                .build();
    }
}
