#라이브러리 임포트 
import pickle
import faiss
import numpy as np
import torch
from flask import Flask, request, jsonify
from sentence_transformers import SentenceTransformer
from PIL import Image
import os

#--Flask 앱, 모델 로드 준비-- 
app = Flask(__name__)  #Flask 서버 인스턴스 생성
print("CLIP 모델 및 데이터베이스 로딩 중... ")

# 1) CLIP 모델 로드(GPU 있으면 cuda, 없으면 cpu 자동 사용)
device = "cuda" if torch.cuda.is_available() else "cpu"
print(f"   - 사용 디바이스: {device}")
model = SentenceTransformer('clip-ViT-B-32', device=device) #CLIP 기반의 clip-ViT-B-32 모델

# 2) 매핑 데이터 로드 (Faiss 인덱스 번호와 상품정보 매핑)
if not os.path.exists('mapping_data.pkl'):
    print("오류: 'mapping_data.pkl' 파일이 없습니다. create_vector_db.py를 먼저 실행하세요.")
    exit() 

with open('mapping_data.pkl', 'rb') as f:
    mapping_data = pickle.load(f)

# 3) 벡터 DB (Faiss 인덱스) 로드
if not os.path.exists('vector_db.index'):
    print("오류: 'vector_db.index' 파일이 없습니다. create_vector_db.py를 먼저 실행하세요.")
    exit()

index = faiss.read_index("vector_db.index")

print(f"로딩 완료! (총 {len(mapping_data)}개 상품 데이터 대기 중)")


# ---API 엔드포인트 정의---

@app.route('/', methods=['GET'])
def index_page():
    return "<h1>Campus Closet Share AI Server</h1><p>서버가 정상 작동 중입니다.</p>"

@app.route('/recommend', methods=['POST'])
def recommend():
    """
    [POST] /recommend
    사용자가 업로드한 이미지를 받아 유사한 상품을 추천합니다.
    """
    try:
        #이미지 파일 받기
        if 'image' not in request.files:
            return jsonify({'error': 'No image uploaded'}), 400
        
        file = request.files['image']
        
        # 이미지를 PIL 형식으로 변환
        image = Image.open(file.stream).convert('RGB')

        # 2. 이미지 -> 벡터 변환 
        query_vector = model.encode([image], convert_to_numpy=True)
        
        # Faiss 검색을 위해 float32로 변환
        query_vector = query_vector.astype(np.float32)

        # 3. 유사도 검색
        k = 3
        # distances: 유사도 점수 (L2 거리)
        # indices: 유사한 상품의 ID(인덱스)
        distances, indices = index.search(query_vector, k)

        # 4. 결과 반환 (JSON)
        recommendations = []
        for idx, dist in zip(indices[0], distances[0]):
            # 인덱스가 유효한지 확인 (-1은 데이터 없음)
            if idx < len(mapping_data) and idx >= 0:
                item = mapping_data[idx]
                # 거리 정보를 점수로 변환
                item_data = {
                    'brand': item['brand_name'],
                    'name': item['product_name'],
                    'link': item['link'],
                    'image': item['image_url'],
                    'category': item.get('product_spec', '-'), # 카테고리 정보 추가
                    'score': float(dist) # 값이 작을수록 유사함
                }
                recommendations.append(item_data)

        return jsonify({
            'status': 'success',
            'count': len(recommendations),
            'recommendations': recommendations
        })

    except Exception as e:
        print(f"에러 발생: {e}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    # 0.0.0.0으로 설정하여 외부 접속 허용
    # 포트 5000번 사용
    print("AI 서버 시작 (http://localhost:5000)")
    app.run(host='0.0.0.0', port=5000, debug=False)