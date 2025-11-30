package com.campus.api;

import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/files")
public class FileController {

    // 프로젝트 실행 디렉토리 기준으로 uploads 폴더에 저장
    private final Path uploadDir = Paths.get("uploads");

    public FileController() throws IOException {
        // 폴더 없으면 생성
        if (!Files.exists(uploadDir)) {
            Files.createDirectories(uploadDir);
        }
    }

    /**
     * 이미지 업로드 엔드포인트
     * POST /files/images
     *
     * form-data:
     *   files: (file[]) 여러 개 가능
     *
     * response:
     *   { "urls": ["http://localhost:8080/files/<파일명>", ...] }
     */
    @PostMapping("/images")
    public ResponseEntity<ImageUploadResponse> uploadImages(
            @RequestParam("files") List<MultipartFile> files
    ) throws IOException {

        List<String> urls = new ArrayList<>();

        for (MultipartFile file : files) {
            if (file.isEmpty()) continue;

            // 원래 파일명에서 확장자만 유지하고, 앞에는 UUID 붙이기
            String originalName = StringUtils.cleanPath(file.getOriginalFilename());
            String ext = "";

            int dot = originalName.lastIndexOf('.');
            if (dot != -1) {
                ext = originalName.substring(dot);
            }

            String storedName = UUID.randomUUID().toString().replace("-", "") + ext;
            Path target = uploadDir.resolve(storedName);

            Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);

            // 현재 서버 주소 기준으로 접근 가능한 URL 생성
            String url = ServletUriComponentsBuilder.fromCurrentContextPath()
                    .path("/files/")
                    .path(storedName)
                    .toUriString();

            urls.add(url);
        }

        ImageUploadResponse resp = new ImageUploadResponse(urls);
        return ResponseEntity.ok(resp);
    }

    /**
     * 업로드된 파일 내려주기
     * GET /files/{filename}
     */
    @GetMapping("/{filename}")
    public ResponseEntity<Resource> serveFile(@PathVariable String filename)
            throws MalformedURLException {

        Path file = uploadDir.resolve(filename).normalize();
        Resource resource = new UrlResource(file.toUri());

        if (!resource.exists()) {
            return ResponseEntity.notFound().build();
        }

        // 간단히 octet-stream 으로 내려주기 (프론트에서 img src로 써도 동작함)
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "inline; filename=\"" + resource.getFilename() + "\"")
                .body(resource);
    }

    // ---- 간단한 응답 DTO ----
    public static class ImageUploadResponse {
        private List<String> urls;

        public ImageUploadResponse() { }

        public ImageUploadResponse(List<String> urls) {
            this.urls = urls;
        }

        public List<String> getUrls() {
            return urls;
        }

        public void setUrls(List<String> urls) {
            this.urls = urls;
        }
    }
}
