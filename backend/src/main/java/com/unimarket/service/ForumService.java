package com.unimarket.service;

import com.unimarket.dto.request.ForumPostRequest;
import com.unimarket.dto.response.ForumPostResponse;
import com.unimarket.entity.*;
import com.unimarket.exception.BadRequestException;
import com.unimarket.exception.ResourceNotFoundException;
import com.unimarket.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.*;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ForumService {

    private final ForumPostRepository forumPostRepository;
    private final PostReactionRepository postReactionRepository;
    private final CommentRepository commentRepository;
    private final DiscussionTopicRepository discussionTopicRepository;
    private final ForumFileRepository forumFileRepository;
    private final AuthService authService;
    private final CloudinaryService cloudinaryService;

    private static final List<String> BAD_WORDS = Arrays.asList(
            "đm", "dcm", "wtf", "shit", "fuck", "damn", "ass", "bitch",
            "ngu", "đần", "khốn", "chó", "mẹ mày", "địt", "cặc", "lồn", "đĩ");

    private static final Pattern BAD_WORD_PATTERN = Pattern.compile(
            "(?i)(" + String.join("|", BAD_WORDS.stream().map(Pattern::quote).collect(Collectors.toList())) + ")");

    @Transactional
    public ForumPostResponse createPost(ForumPostRequest request, List<MultipartFile> files) {
        User author = authService.getCurrentUser();

        if (containsBadWords(request.getContent()) || containsBadWords(request.getTitle())) {
            throw new BadRequestException("Bài viết chứa từ ngữ không phù hợp. Vui lòng chỉnh sửa lại.");
        }

        PostType postType = PostType.valueOf(request.getPostType().toUpperCase());

        if (postType == PostType.LONG && (request.getTitle() == null || request.getTitle().isBlank())) {
            throw new BadRequestException("Bài viết dạng dài phải có tiêu đề.");
        }
        if (postType == PostType.LONG && request.getTopicId() == null) {
            throw new BadRequestException("Bài viết dạng dài phải có chủ đề trao đổi.");
        }

        ForumPost post = ForumPost.builder()
                .title(request.getTitle())
                .content(request.getContent())
                .author(author)
                .postType(postType)
                .build();

        if (request.getTopicId() != null) {
            DiscussionTopic topic = discussionTopicRepository.findById(request.getTopicId())
                    .orElseThrow(() -> new ResourceNotFoundException("Chủ đề không tồn tại"));
            post.setTopic(topic);
        }

        post = forumPostRepository.save(post);

        if (request.getTags() != null) {
            ForumPost finalPost = post;
            List<PostTag> tags = request.getTags().stream()
                    .map(tag -> PostTag.builder().post(finalPost).tag(tag).build())
                    .collect(Collectors.toList());
            post.setTags(tags);
        }

        if (files != null && !files.isEmpty()) {
            ForumPost finalPost2 = post;
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
                    PostFile postFile = PostFile.builder().post(finalPost2).file(forumFile).build();
                    finalPost2.getFiles().add(postFile);
                } catch (IOException e) {
                    throw new BadRequestException("Không thể upload file: " + file.getOriginalFilename());
                }
            }
        }

        post = forumPostRepository.save(post);
        return toResponse(post, null);
    }

    @Transactional
    public ForumPostResponse updatePost(Long postId, ForumPostRequest request, List<MultipartFile> files) {
        User user = authService.getCurrentUser();
        ForumPost post = forumPostRepository.findById(postId)
                .orElseThrow(() -> new ResourceNotFoundException("Bài viết không tồn tại"));

        if (!post.getAuthor().getId().equals(user.getId())) {
            throw new BadRequestException("Bạn không có quyền chỉnh sửa bài viết này");
        }

        if (containsBadWords(request.getContent()) || containsBadWords(request.getTitle())) {
            throw new BadRequestException("Bài viết chứa từ ngữ không phù hợp. Vui lòng chỉnh sửa lại.");
        }

        post.setTitle(request.getTitle());
        post.setContent(request.getContent());

        if (request.getTopicId() != null) {
            DiscussionTopic topic = discussionTopicRepository.findById(request.getTopicId())
                    .orElseThrow(() -> new ResourceNotFoundException("Chủ đề không tồn tại"));
            post.setTopic(topic);
        }

        post.getTags().clear();
        if (request.getTags() != null) {
            ForumPost tagPost = post;
            request.getTags().forEach(tag -> tagPost.getTags().add(PostTag.builder().post(tagPost).tag(tag).build()));
        }

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
                    post.getFiles().add(PostFile.builder().post(post).file(forumFile).build());
                } catch (IOException e) {
                    throw new BadRequestException("Không thể upload file: " + file.getOriginalFilename());
                }
            }
        }

        ForumPost savedPost = forumPostRepository.save(post);
        return toResponse(savedPost, user.getId());
    }

    @Transactional
    public void deletePost(Long postId) {
        User user = authService.getCurrentUser();
        ForumPost post = forumPostRepository.findById(postId)
                .orElseThrow(() -> new ResourceNotFoundException("Bài viết không tồn tại"));

        boolean isAdmin = user.getRole() == Role.ADMIN;
        if (!post.getAuthor().getId().equals(user.getId()) && !isAdmin) {
            throw new BadRequestException("Bạn không có quyền xoá bài viết này");
        }

        forumPostRepository.delete(post);
    }

    @Transactional
    public ForumPostResponse getPostById(Long postId) {
        ForumPost post = forumPostRepository.findById(postId)
                .orElseThrow(() -> new ResourceNotFoundException("Bài viết không tồn tại"));

        post.setViewCount(post.getViewCount() + 1);
        forumPostRepository.save(post);

        Long currentUserId = null;
        try {
            currentUserId = authService.getCurrentUser().getId();
        } catch (Exception ignored) {
        }

        return toResponse(post, currentUserId);
    }

    public Page<ForumPostResponse> getPosts(int page, int size, String type, Long topicId, Long authorId,
            String keyword) {
        PageRequest pageable = PageRequest.of(page, size);
        Long currentUserId = null;
        try {
            currentUserId = authService.getCurrentUser().getId();
        } catch (Exception ignored) {
        }

        Page<ForumPost> posts;
        if (keyword != null && !keyword.isBlank()) {
            posts = forumPostRepository.searchByKeyword(keyword, pageable);
        } else if (authorId != null) {
            posts = forumPostRepository.findByAuthorIdOrderByCreatedAtDesc(authorId, pageable);
        } else if (topicId != null) {
            posts = forumPostRepository.findByTopicIdOrderByCreatedAtDesc(topicId, pageable);
        } else if (type != null && !type.isBlank()) {
            posts = forumPostRepository.findByPostTypeOrderByCreatedAtDesc(PostType.valueOf(type.toUpperCase()),
                    pageable);
        } else {
            posts = forumPostRepository.findAllByOrderByCreatedAtDesc(pageable);
        }

        Long finalCurrentUserId = currentUserId;
        return posts.map(post -> toResponse(post, finalCurrentUserId));
    }

    @Transactional
    public ForumPostResponse toggleReaction(Long postId, String reactionTypeStr) {
        User user = authService.getCurrentUser();
        ForumPost post = forumPostRepository.findById(postId)
                .orElseThrow(() -> new ResourceNotFoundException("Bài viết không tồn tại"));

        ReactionType reactionType = ReactionType.valueOf(reactionTypeStr.toUpperCase());

        Optional<PostReaction> existing = postReactionRepository.findByPostIdAndUserId(postId, user.getId());
        if (existing.isPresent()) {
            PostReaction reaction = existing.get();
            if (reaction.getReactionType() == reactionType) {
                postReactionRepository.delete(reaction);
            } else {
                reaction.setReactionType(reactionType);
                postReactionRepository.save(reaction);
            }
        } else {
            PostReaction reaction = PostReaction.builder()
                    .post(post)
                    .user(user)
                    .reactionType(reactionType)
                    .build();
            postReactionRepository.save(reaction);
        }

        return toResponse(post, user.getId());
    }

    @Transactional
    public void reportPost(Long postId) {
        ForumPost post = forumPostRepository.findById(postId)
                .orElseThrow(() -> new ResourceNotFoundException("Bài viết không tồn tại"));
        post.setIsReported(true);
        forumPostRepository.save(post);
    }

    public Page<ForumPostResponse> getReportedPosts(int page, int size) {
        PageRequest pageable = PageRequest.of(page, size);
        Long currentUserId = null;
        try {
            currentUserId = authService.getCurrentUser().getId();
        } catch (Exception ignored) {
        }
        Long finalCurrentUserId = currentUserId;
        return forumPostRepository.findByIsReportedTrueOrderByCreatedAtDesc(pageable)
                .map(post -> toResponse(post, finalCurrentUserId));
    }

    @Transactional
    public void dismissReport(Long postId) {
        ForumPost post = forumPostRepository.findById(postId)
                .orElseThrow(() -> new ResourceNotFoundException("Bài viết không tồn tại"));
        post.setIsReported(false);
        forumPostRepository.save(post);
    }

    private boolean containsBadWords(String text) {
        if (text == null)
            return false;
        return BAD_WORD_PATTERN.matcher(text).find();
    }

    private ForumPostResponse toResponse(ForumPost post, Long currentUserId) {
        Map<String, Long> reactionCounts = new HashMap<>();
        List<Object[]> counts = postReactionRepository.countByPostIdGroupByType(post.getId());
        for (Object[] row : counts) {
            reactionCounts.put(((ReactionType) row[0]).name(), (Long) row[1]);
        }

        String userReaction = null;
        if (currentUserId != null) {
            Optional<PostReaction> userReact = postReactionRepository.findByPostIdAndUserId(post.getId(),
                    currentUserId);
            userReaction = userReact.map(r -> r.getReactionType().name()).orElse(null);
        }

        long commentCount = commentRepository.countByPostId(post.getId());
        return ForumPostResponse.fromPost(post, reactionCounts, userReaction, commentCount);
    }
}
