package com.unimarket.controller;

import com.unimarket.dto.response.ApiResponse;
import com.unimarket.service.CloudinaryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/upload")
@RequiredArgsConstructor
public class UploadController {

    private final CloudinaryService cloudinaryService;

    @PostMapping("/image")
    public ResponseEntity<ApiResponse<String>> uploadImage(@RequestParam("file") MultipartFile file) {
        try {
            String url = cloudinaryService.uploadImage(file);
            return ResponseEntity.ok(ApiResponse.success("Image uploaded", url));
        } catch (IOException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Upload failed: " + e.getMessage()));
        }
    }

    @PostMapping("/images")
    public ResponseEntity<ApiResponse<List<String>>> uploadImages(@RequestParam("files") MultipartFile[] files) {
        try {
            List<String> urls = new ArrayList<>();
            for (MultipartFile file : files) {
                String url = cloudinaryService.uploadImage(file);
                urls.add(url);
            }
            return ResponseEntity.ok(ApiResponse.success("Images uploaded", urls));
        } catch (IOException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Upload failed: " + e.getMessage()));
        }
    }

    @PostMapping("/product-image")
    public ResponseEntity<ApiResponse<String>> uploadProductImage(@RequestParam("file") MultipartFile file) {
        try {
            String url = cloudinaryService.uploadImage(file, "products");
            return ResponseEntity.ok(ApiResponse.success("Product image uploaded", url));
        } catch (IOException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Upload failed: " + e.getMessage()));
        }
    }

    @PostMapping("/avatar")
    public ResponseEntity<ApiResponse<String>> uploadAvatar(@RequestParam("file") MultipartFile file) {
        try {
            String url = cloudinaryService.uploadImage(file, "avatars");
            return ResponseEntity.ok(ApiResponse.success("Avatar uploaded", url));
        } catch (IOException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Upload failed: " + e.getMessage()));
        }
    }
}
