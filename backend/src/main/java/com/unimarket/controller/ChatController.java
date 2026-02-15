package com.unimarket.controller;

import com.unimarket.dto.request.ChatRequest;
import com.unimarket.dto.response.ApiResponse;
import com.unimarket.dto.response.ChatResponse;
import com.unimarket.service.ChatService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
public class ChatController {

    private final ChatService chatService;

    @PostMapping
    public ResponseEntity<ApiResponse<ChatResponse>> chat(@RequestBody ChatRequest request) {
        return ResponseEntity.ok(ApiResponse.success(chatService.chat(request.getMessage())));
    }
}
