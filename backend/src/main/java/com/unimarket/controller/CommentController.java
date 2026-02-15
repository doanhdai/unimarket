package com.unimarket.controller;

import com.unimarket.dto.request.CommentRequest;
import com.unimarket.dto.response.ApiResponse;
import com.unimarket.dto.response.CommentResponse;
import com.unimarket.service.CommentService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/forum")
@RequiredArgsConstructor
public class CommentController {

    private final CommentService commentService;

    @GetMapping("/posts/{postId}/comments")
    public ResponseEntity<ApiResponse<Page<CommentResponse>>> getComments(
            @PathVariable Long postId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.success(commentService.getComments(postId, page, size)));
    }

    @PostMapping(value = "/posts/{postId}/comments", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<CommentResponse>> addComment(
            @PathVariable Long postId,
            @RequestPart("comment") CommentRequest request,
            @RequestPart(value = "files", required = false) List<MultipartFile> files) {
        return ResponseEntity.ok(ApiResponse.success(commentService.addComment(postId, request, files)));
    }

    @DeleteMapping("/comments/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteComment(@PathVariable Long id) {
        commentService.deleteComment(id);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    @PutMapping("/comments/{id}/like")
    public ResponseEntity<ApiResponse<CommentResponse>> toggleLike(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(commentService.toggleLike(id)));
    }
}
