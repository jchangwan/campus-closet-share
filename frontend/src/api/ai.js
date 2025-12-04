// src/api/ai.js
import api from "./client";

/**
 * AI 서버를 통해 비슷한 게시글 추천 받기
 * @param {string} imageUrl 업로드된 이미지의 URL
 * @param {number} topN 추천 개수 (기본 5개)
 * @returns {Promise<Array>} Post 배열
 */
export async function recommendSimilarPosts(imageUrl, topN = 5) {
  const res = await api.post("/ai/recommend", {
    imageUrl,
    topN,
  });
  return res.data; // List<Post>
}
