package com.unimarket.dto.request;

import lombok.Data;

import java.util.List;

@Data
public class ForumPostRequest {
    private String title;
    private String content;
    private String postType;
    private Long topicId;
    private List<String> tags;
}
