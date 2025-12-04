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

    @Value("${ai.server.url:http://localhost:8000}")
    private String aiServerUrl;

    public AiRecommendController(PostRepository postRepo) {
        this.postRepo = postRepo;
    }

    @PostMapping("/recommend")
    public List<Post> recommend(@RequestBody AiRequest req) {

        if (req.topN == null || req.topN <= 0) {
            req.topN = 5;
        }

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
            return List.of();
        }

        return postRepo.findAllById(ai.similarIds);
    }

    public static class AiRequest {
        public String imageUrl;
        public Integer topN;
    }

    public static class AiResponse {
        public List<Long> similarIds;
    }
}
