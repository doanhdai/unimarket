package com.unimarket.controller;

import com.unimarket.dto.request.ForumPostRequest;
import com.unimarket.dto.response.ApiResponse;
import com.unimarket.dto.response.ForumPostResponse;
import com.unimarket.entity.DiscussionTopic;
import com.unimarket.repository.DiscussionTopicRepository;
import com.unimarket.service.ForumService;
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
public class ForumController {

    private final ForumService forumService;
    private final DiscussionTopicRepository discussionTopicRepository;

    @GetMapping("/posts")
    public ResponseEntity<ApiResponse<Page<ForumPostResponse>>> getPosts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) Long topicId,
            @RequestParam(required = false) Long authorId,
            @RequestParam(required = false) String keyword) {
        return ResponseEntity
                .ok(ApiResponse.success(forumService.getPosts(page, size, type, topicId, authorId, keyword)));
    }

    @GetMapping("/posts/{id}")
    public ResponseEntity<ApiResponse<ForumPostResponse>> getPost(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(forumService.getPostById(id)));
    }

    @PostMapping(value = "/posts", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<ForumPostResponse>> createPost(
            @RequestPart("post") ForumPostRequest request,
            @RequestPart(value = "files", required = false) List<MultipartFile> files) {
        return ResponseEntity.ok(ApiResponse.success(forumService.createPost(request, files)));
    }

    @PutMapping(value = "/posts/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<ForumPostResponse>> updatePost(
            @PathVariable Long id,
            @RequestPart("post") ForumPostRequest request,
            @RequestPart(value = "files", required = false) List<MultipartFile> files) {
        return ResponseEntity.ok(ApiResponse.success(forumService.updatePost(id, request, files)));
    }

    @DeleteMapping("/posts/{id}")
    public ResponseEntity<ApiResponse<Void>> deletePost(@PathVariable Long id) {
        forumService.deletePost(id);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    @PostMapping("/posts/{id}/react")
    public ResponseEntity<ApiResponse<ForumPostResponse>> reactToPost(
            @PathVariable Long id, @RequestParam String type) {
        return ResponseEntity.ok(ApiResponse.success(forumService.toggleReaction(id, type)));
    }

    @PostMapping("/posts/{id}/report")
    public ResponseEntity<ApiResponse<Void>> reportPost(@PathVariable Long id) {
        forumService.reportPost(id);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    @GetMapping("/topics")
    public ResponseEntity<ApiResponse<List<DiscussionTopic>>> getTopics() {
        return ResponseEntity.ok(ApiResponse.success(discussionTopicRepository.findAllByOrderByTitleAsc()));
    }

    @PostMapping("/topics")
    public ResponseEntity<ApiResponse<DiscussionTopic>> createTopic(@RequestBody DiscussionTopic topic) {
        return ResponseEntity.ok(ApiResponse.success(discussionTopicRepository.save(topic)));
    }

    @DeleteMapping("/topics/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteTopic(@PathVariable Long id) {
        discussionTopicRepository.deleteById(id);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    // Admin endpoints
    @GetMapping("/admin/reported")
    public ResponseEntity<ApiResponse<Page<ForumPostResponse>>> getReportedPosts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.success(forumService.getReportedPosts(page, size)));
    }

    @PutMapping("/admin/posts/{id}/dismiss")
    public ResponseEntity<ApiResponse<Void>> dismissReport(@PathVariable Long id) {
        forumService.dismissReport(id);
        return ResponseEntity.ok(ApiResponse.success(null));
    }
}
