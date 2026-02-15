package com.unimarket.service;

import com.unimarket.dto.request.CommentRequest;
import com.unimarket.dto.response.CommentResponse;
import com.unimarket.entity.*;
import com.unimarket.exception.BadRequestException;
import com.unimarket.exception.ResourceNotFoundException;
import com.unimarket.repository.CommentRepository;
import com.unimarket.repository.ForumFileRepository;
import com.unimarket.repository.ForumPostRepository;

import java.io.IOException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CommentService {

    private final CommentRepository commentRepository;
    private final ForumPostRepository forumPostRepository;
    private final ForumFileRepository forumFileRepository;
    private final AuthService authService;
    private final CloudinaryService cloudinaryService;

    @Transactional
    public CommentResponse addComment(Long postId, CommentRequest request, List<MultipartFile> files) {
        User user = authService.getCurrentUser();
        ForumPost post = forumPostRepository.findById(postId)
                .orElseThrow(() -> new ResourceNotFoundException("Bài viết không tồn tại"));

        Comment comment = Comment.builder()
                .post(post)
                .user(user)
                .content(request.getContent())
                .build();

        if (request.getParentId() != null) {
            Comment parent = commentRepository.findById(request.getParentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Bình luận cha không tồn tại"));
            comment.setParent(parent);
        }

        comment = commentRepository.save(comment);

        if (files != null && !files.isEmpty()) {
            for (MultipartFile file : files) {
                try {
                    String url = cloudinaryService.uploadImage(file);
                    ForumFile forumFile = ForumFile.builder()
                            .originalName(file.getOriginalFilename())
                            .fileType(file.getContentType())
                            .fileSize(file.getSize())
                            .filePath(url)
                            .build();
                    forumFile = forumFileRepository.save(forumFile);
                    CommentFile commentFile = CommentFile.builder().comment(comment).file(forumFile).build();
                    comment.getFiles().add(commentFile);
                } catch (IOException e) {
                    throw new BadRequestException("Không thể upload file: " + file.getOriginalFilename());
                }
            }
            comment = commentRepository.save(comment);
        }

        return CommentResponse.fromComment(comment);
    }

    public Page<CommentResponse> getComments(Long postId, int page, int size) {
        PageRequest pageable = PageRequest.of(page, size);
        return commentRepository.findByPostIdAndParentIsNullOrderByCreatedAtDesc(postId, pageable)
                .map(CommentResponse::fromComment);
    }

    @Transactional
    public void deleteComment(Long commentId) {
        User user = authService.getCurrentUser();
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new ResourceNotFoundException("Bình luận không tồn tại"));

        boolean isAdmin = user.getRole() == Role.ADMIN;
        if (!comment.getUser().getId().equals(user.getId()) && !isAdmin) {
            throw new BadRequestException("Bạn không có quyền xoá bình luận này");
        }

        commentRepository.delete(comment);
    }

    @Transactional
    public CommentResponse toggleLike(Long commentId) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new ResourceNotFoundException("Bình luận không tồn tại"));
        comment.setIsLiked(!comment.getIsLiked());
        comment = commentRepository.save(comment);
        return CommentResponse.fromComment(comment);
    }
}
