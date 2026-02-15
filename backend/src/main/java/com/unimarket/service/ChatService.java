package com.unimarket.service;

import com.unimarket.dto.response.ChatResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@Service
@RequiredArgsConstructor
public class ChatService {

    @Value("${gemini.api.key:}")
    private String apiKey;

    @Value("${gemini.api.url:https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent}")
    private String apiUrl;

    private final RestTemplate restTemplate = new RestTemplate();

    public ChatResponse chat(String message) {
        if (apiKey == null || apiKey.isBlank()) {
            return ChatResponse.builder()
                    .reply("AI Chatbox chưa được cấu hình. Vui lòng thêm Gemini API key vào application.properties.")
                    .build();
        }

        try {
            String url = apiUrl + "?key=" + apiKey;

            Map<String, Object> textPart = new HashMap<>();
            textPart.put("text",
                    "Bạn là trợ lý mua sắm UniMarket. Hãy trả lời bằng tiếng Việt, ngắn gọn và hữu ích. Câu hỏi: "
                            + message);

            Map<String, Object> part = new HashMap<>();
            part.put("parts", List.of(textPart));

            Map<String, Object> body = new HashMap<>();
            body.put("contents", List.of(part));

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);
            ResponseEntity<Map> response = restTemplate.exchange(url, HttpMethod.POST, entity, Map.class);

            if (response.getBody() != null) {
                List<Map<String, Object>> candidates = (List<Map<String, Object>>) response.getBody().get("candidates");
                if (candidates != null && !candidates.isEmpty()) {
                    Map<String, Object> content = (Map<String, Object>) candidates.get(0).get("content");
                    List<Map<String, Object>> parts = (List<Map<String, Object>>) content.get("parts");
                    if (parts != null && !parts.isEmpty()) {
                        String reply = (String) parts.get(0).get("text");
                        return ChatResponse.builder().reply(reply).build();
                    }
                }
            }

            return ChatResponse.builder().reply("Xin lỗi, không thể xử lý yêu cầu.").build();
        } catch (Exception e) {
            return ChatResponse.builder()
                    .reply("Lỗi kết nối AI: " + e.getMessage())
                    .build();
        }
    }
}
