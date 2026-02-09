package com.unimarket.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class CloudinaryService {

    private final Cloudinary cloudinary;

    public String uploadImage(MultipartFile file) throws IOException {
        Map<?, ?> uploadResult = cloudinary.uploader().upload(
                file.getBytes(),
                ObjectUtils.asMap(
                        "folder", "unimarket",
                        "resource_type", "auto"));
        return (String) uploadResult.get("secure_url");
    }

    public String uploadImage(MultipartFile file, String folder) throws IOException {
        Map<?, ?> uploadResult = cloudinary.uploader().upload(
                file.getBytes(),
                ObjectUtils.asMap(
                        "folder", "unimarket/" + folder,
                        "resource_type", "auto"));
        return (String) uploadResult.get("secure_url");
    }

    public void deleteImage(String publicId) throws IOException {
        cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
    }

    public String extractPublicId(String url) {
        if (url == null || !url.contains("cloudinary.com")) {
            return null;
        }
        String[] parts = url.split("/");
        String filename = parts[parts.length - 1];
        return filename.substring(0, filename.lastIndexOf('.'));
    }
}
