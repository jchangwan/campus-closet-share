import pickle
import faiss
import numpy as np
import torch
from flask import Flask, request, jsonify
from sentence_transformers import SentenceTransformer
from PIL import Image
import os
import requests

app = Flask(__name__)

# --- 설정 ---
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_NAME = 'clip-ViT-B-32'
MAPPING_FILE = os.path.join(BASE_DIR, "mapping_data.pkl")
INDEX_FILE = os.path.join(BASE_DIR, "vector_db.index")


# --- 1. 모델 및 데이터 로드 ---
print(f"Loading Model: {MODEL_NAME}...")
device = "cuda" if torch.cuda.is_available() else "cpu"
model = SentenceTransformer(MODEL_NAME, device=device)

print("Loading Faiss Index & Mapping Data...")
mapping_data = {}
index = None

if os.path.exists(MAPPING_FILE):
    with open(MAPPING_FILE, 'rb') as f:
        mapping_data = pickle.load(f)
else:
    print(f"Warning: {MAPPING_FILE} not found.")

if os.path.exists(INDEX_FILE):
    index = faiss.read_index(INDEX_FILE)
else:
    print(f"Warning: {INDEX_FILE} not found.")

print("Server is ready.")


# --- 2. 헬스 체크 ---
@app.route('/health', methods=['GET'])
def health():
    status = "ok" if index is not None and mapping_data else "degraded"
    return jsonify({
        "status": status,
        "device": device,
        "index_size": index.ntotal if index else 0
    })


# --- 벡터 검색 공통 함수 ---
def search_core(image, k=5):
    query_vector = model.encode([image], convert_to_numpy=True)
    query_vector = query_vector.astype(np.float32)
    distances, indices = index.search(query_vector, k)
    return distances[0], indices[0]


# --- 3. 파일 기반 검색 ---
@app.route('/search', methods=['POST'])
def search():
    if index is None or not mapping_data:
        return jsonify({'error': 'Search engine not initialized'}), 503

    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    try:
        image = Image.open(file.stream).convert("RGB")
        distances, indices = search_core(image, 5)

        results = []
        for idx, dist in zip(indices, distances):
            if idx != -1 and idx < len(mapping_data):
                item = mapping_data[idx]
                results.append({
                    'product_id': int(idx),
                    'brand': item.get('brand_name', ''),
                    'name': item.get('product_name', ''),
                    'image': item.get('image_url', ''),
                    'link': item.get('link', ''),
                    'score': float(dist)
                })

        return jsonify({'results': results})

    except Exception as e:
        print("Search Error:", e)
        return jsonify({'error': str(e)}), 500


# --- 4. 스프링에서 JSON 요청용 추천 ---
@app.route('/recommend', methods=['POST'])
def recommend():
    if index is None or not mapping_data:
        return jsonify({'error': 'Search engine not initialized'}), 503

    data = request.get_json(silent=True) or {}
    image_url = data.get('imageUrl')
    top_n = int(data.get('topN', 5))

    if not image_url:
        return jsonify({'error': 'imageUrl is required'}), 400

    # 🔥 도커 네트워크 안에서 localhost:8080 은 안 보이니까 api-java 로 바꿔줌
    if image_url.startswith("http://localhost:8080"):
        image_url = image_url.replace("http://localhost:8080", "http://api-java:8080")
    if image_url.startswith("https://localhost:8080"):
        image_url = image_url.replace("https://localhost:8080", "http://api-java:8080")

    try:
        # 1) 이미지 URL에서 로드
        resp = requests.get(image_url, stream=True, timeout=10)
        resp.raise_for_status()
        image = Image.open(resp.raw).convert("RGB")

        # 2) 검색
        distances, indices = search_core(image, top_n)

        # 3) 인덱스를 ID로 변환
        similar_ids = []
        for idx in indices:
            if idx == -1 or idx >= len(mapping_data):
                continue
            item = mapping_data[idx]
            similar_ids.append(int(item.get('post_id', idx)))

        return jsonify({'similarIds': similar_ids})

    except Exception as e:
        print(f"Search Error: {e}")
        return jsonify({'error': str(e)}), 500



if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000)
