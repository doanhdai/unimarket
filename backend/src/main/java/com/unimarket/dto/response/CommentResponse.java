package com.unimarket.dto.response;

import com.unimarket.entity.Comment;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Data
@Builder
public class CommentResponse {
    private Long id;
    private Long postId;
    private Long userId;
    private String userName;
    private String userAvatar;
    private String content;
    private Boolean isLiked;
    private Long parentId;
    private List<CommentResponse> replies;
    private List<ForumPostResponse.FileResponse> files;
    private LocalDateTime createdAt;

    public static CommentResponse fromComment(Comment comment) {
        return CommentResponse.builder()
                .id(comment.getId())
                .postId(comment.getPost().getId())
                .userId(comment.getUser().getId())
                .userName(comment.getUser().getFullName())
                .userAvatar(comment.getUser().getAvatar())
                .content(comment.getContent())
                .isLiked(comment.getIsLiked())
                .parentId(comment.getParent() != null ? comment.getParent().getId() : null)
                .replies(comment.getReplies() != null
                        ? comment.getReplies().stream().map(CommentResponse::fromComment).collect(Collectors.toList())
                        : List.of())
                .files(comment.getFiles() != null
                        ? comment.getFiles().stream().map(cf -> ForumPostResponse.FileResponse.builder()
                                .id(cf.getFile().getId())
                                .originalName(cf.getFile().getOriginalName())
                                .fileType(cf.getFile().getFileType())
                                .fileSize(cf.getFile().getFileSize())
                                .filePath(cf.getFile().getFilePath())
                                .build()).collect(Collectors.toList())
                        : List.of())
                .createdAt(comment.getCreatedAt())
                .build();
    }
}
