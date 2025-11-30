package com.campus.api;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.util.List;

@RestController
@RequestMapping("/ai")
public class AiRecommendController {

    private final RestTemplate restTemplate = new RestTemplate();
    private final PostRepository postRepo;

    // application.yml 등에 ai.server.url 없으면 기본값으로 localhost:8000 사용
    @Value("${ai.server.url:http://localhost:8000}")
    private String aiServerUrl;

    public AiRecommendController(PostRepository postRepo) {
        this.postRepo = postRepo;
    }

    /**
     * 프론트에서 유저가 업로드한 이미지 URL을 넘기면,
     * AI 서버에 요청을 보내서 비슷한 게시글(Post)들을 추천받는 엔드포인트.
     *
     * POST /ai/recommend
     *
     * 요청 예:
     * {
     *   "imageUrl": "https://.../user-upload.png",
     *   "topN": 5
     * }
     */
    @PostMapping("/recommend")
    public List<Post> recommend(@RequestBody AiRequest req) {

        // topN 기본값
        if (req.topN == null || req.topN <= 0) {
            req.topN = 5;
        }

        // 1) AI 서버에 요청 보내기
        String url = aiServerUrl + "/recommend";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<AiRequest> entity = new HttpEntity<>(req, headers);

        ResponseEntity<AiResponse> resp = restTemplate.exchange(
                url,
                HttpMethod.POST,
                entity,
                AiResponse.class
        );

        AiResponse ai = resp.getBody();
        if (ai == null || ai.similarIds == null || ai.similarIds.isEmpty()) {
            // 추천 결과가 없으면 빈 리스트 반환
            return List.of();
        }

        // 2) 추천받은 id들에 해당하는 Post 리스트 반환
        return postRepo.findAllById(ai.similarIds);
    }

    // === 요청 DTO ===
    public static class AiRequest {
        public String imageUrl;
        public Integer topN;
    }

    // === AI 서버 응답 DTO ===
    public static class AiResponse {
        public List<Long> similarIds;
    }
}
