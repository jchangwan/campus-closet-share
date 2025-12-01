import pickle
import faiss
import numpy as np
import torch
from flask import Flask, request, jsonify
from sentence_transformers import SentenceTransformer
from PIL import Image
import os

app = Flask(__name__)

# --- 설정 ---
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_NAME = 'clip-ViT-B-32'
MAPPING_FILE = os.path.join(BASE_DIR, "mapping_data.pkl")
INDEX_FILE = os.path.join(BASE_DIR, "vector_db.index")


# --- 1. 모델 및 데이터 로드 ---
print(f"Loading Model: {MODEL_NAME}...")
device = "cuda" if torch.cuda.is_available() else "cpu"
# Docker 빌드 시 미리 받아둔 캐시를 사용하므로 로딩이 빠름
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


# --- 2. 헬스 체크 엔드포인트 ---
@app.route('/health', methods=['GET'])
def health():
    """서버가 살아있는지 확인하는 API"""
    status = "ok" if index is not None and mapping_data else "degraded"
    return jsonify({
        "status": status,
        "device": device,
        "index_size": index.ntotal if index else 0
    })


# --- 3. 검색 엔드포인트 ---
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
        # 이미지 로드 (메모리 상에서 바로 처리)
        image = Image.open(file.stream).convert("RGB")
        
        # 벡터화
        query_vector = model.encode([image], convert_to_numpy=True)
        query_vector = query_vector.astype(np.float32)

        # 검색 (Top 5)
        k = 5
        distances, indices = index.search(query_vector, k)

        results = []
        # 배치 처리가 아니므로 첫 번째 결과([0])만 사용
        for idx, dist in zip(indices[0], distances[0]):
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
        print(f"Search Error: {e}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    # Docker 외부 접속을 위해 host='0.0.0.0' 필수
    app.run(host='0.0.0.0', port=5000)