# 👕 Campus Closet Share (캠퍼스 옷 공유 플랫폼)

![Project Status](https://img.shields.io/badge/Status-Active-brightgreen)
![License](https://img.shields.io/badge/License-MIT-blue)

> **"캠퍼스 내에서 시작되는 지속 가능한 패션 라이프"** > AI 기반 스타일 추천과 실시간 커뮤니티 기능을 결합한 대학생 전용 의류 공유 플랫폼입니다.
## 📖 프로젝트 소개
**Campus Closet Share**는 학교 이메일 인증을 통해 신뢰할 수 있는 교내 구성원끼리 옷을 빌려주고 빌릴 수 있는 플랫폼입니다.
단순한 대여를 넘어, **AI 이미지 검색**을 통해 내 취향의 옷을 찾고 대학생 룩북 커뮤니티를 통해 패션 정보를 공유할 수 있습니다.

### 🌟 주요 기능
* **🔐 학교 인증 시스템:** `.ac.kr` 이메일 인증을 통한 안전한 사용자 검증
* **📅 의류 스케줄링 대여:** 캘린더 기반의 예약 시스템으로 중복 없는 대여 관리
* **🔍 AI 스마트 검색:** 텍스트가 아닌 **이미지**로 유사한 스타일의 교내 매물 검색 (Computer Vision 적용)
* **👗 캠퍼스 룩북:** 착용샷 공유 및 스타일 커뮤니티 기능

---

## 🌟 Key Features (핵심 기능)

### 🎨 1. SPA 기반의 몰입형 UX (Frontend)
* **Vite + React**를 활용한 끊김 없는 페이지 전환과 빠른 렌더링 속도 제공
* **Utility-First CSS (Tailwind)** 기반의 'Indigo-Purple' 그라데이션 테마 디자인 시스템 적용
* 반응형 레이아웃(Responsive Design)으로 모바일과 데스크톱 환경 완벽 지원

### 🧠 2. AI 의류 추천 엔진 (AI/Data)
* **PyTorch & FAISS** 기반의 벡터 유사도 검색 시스템 구축
* 단순 텍스트 검색을 넘어, 사용자가 업로드한 이미지와 **유사한 스타일의 의류를 0.1초 내에 추천**
* 수만 개의 의류 데이터 중 가장 적합한 아이템을 찾아내는 '스마트 검색' 구현

### 🛡️ 3. 안정적인 API 서버 (Backend)
* **Spring Boot & JPA**를 활용한 견고한 객체 지향 아키텍처 설계
* 복잡한 관계형 데이터(User-Post-Comment)를 효율적으로 처리
* **X-USER-ID** 헤더 기반의 경량화된 인증 시스템 및 RBAC 권한 관리

### 🐳 4. 다중 컨테이너 통합 환경 (DevOps)
* Backend(Java), Frontend(React), AI(Python) 3가지 이기종 환경을 **Docker Compose**로 통합
* `docker-compose up` 명령어 한 줄로 전체 마이크로서비스 실행 환경 구축
* GitHub Actions를 통한 CI/CD 파이프라인 자동화 (Build → Test → Docker Hub Push)

---

## 🛠 Tech Stack

| Category | Tech Stack | Description |
| :--- | :--- | :--- |
| **Frontend** | ![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB) ![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat&logo=vite&logoColor=white) | React 18, Vite, Tailwind CSS, Axios |
| **Backend** | ![Spring Boot](https://img.shields.io/badge/Spring_Boot-6DB33F?style=flat&logo=springboot&logoColor=white) ![Java](https://img.shields.io/badge/Java-ED8B00?style=flat&logo=openjdk&logoColor=white) | Java 17, Spring Data JPA, Gradle, MySQL |
| **AI / ML** | ![Python](https://img.shields.io/badge/Python-3776AB?style=flat&logo=python&logoColor=white) ![PyTorch](https://img.shields.io/badge/PyTorch-EE4C2C?style=flat&logo=pytorch&logoColor=white) | Flask, PyTorch, FAISS (Facebook AI Similarity Search) |
| **Infra** | ![Docker](https://img.shields.io/badge/Docker-2496ED?style=flat&logo=docker&logoColor=white) | Docker, Docker Compose, GitHub Actions |

---

## 🏗️ System Architecture

전체 시스템은 **Client-Server-AI**의 3-Tier 구조로 설계되었습니다.
   
Frontend Container: Nginx/Vite 서버를 통해 정적 리소스 제공

Backend Container: 비즈니스 로직 처리 및 DB 트랜잭션 관리

AI Container: 이미지 분석 및 추천 알고리즘 수행 (Flask API)

📂 Project Structure
Bash

campus-closet-share/
├── frontend/          # React + Vite Client Application
│   ├── src/           # UI Components & Pages
│   └── Dockerfile     # Frontend Build Config
├── backend/           # Spring Boot API Server
│   ├── src/main/java  # Controllers, Services, Repositories
│   └── Dockerfile     # Backend Build Config
├── ai/                # Python AI Recommendation Server
│   ├── model/         # PyTorch Models
│   ├── app.py         # Flask Entry Point
│   └── Dockerfile     # AI Env Config
└── docker-compose.yml # Orchestration Configuration



🚀 Getting Started
이 프로젝트는 Docker 환경에 최적화되어 있습니다. 로컬 환경에서 가장 빠르게 실행하는 방법은 다음과 같습니다.

Prerequisites
Docker & Docker Compose

Quick Run (All-in-One)
Bash

# 1. 저장소 클론
git clone [https://github.com/jchangwan/campus-closet-share.git](https://github.com/jchangwan/campus-closet-share.git)

# 2. 프로젝트 루트로 이동
cd campus-closet-share

# 3. 전체 서비스 실행 (Frontend + Backend + AI + DB)
docker-compose up -d --build
실행 후 브라우저에서 접속:

Web Client: http://localhost:5173

API Documentation: http://localhost:8080/swagger-ui.html (Optional)

📝 API Specification Summary
Auth & User
POST /auth/login: 사용자 로그인

GET /users/me: 내 프로필 및 옷장 정보 조회

Feed & Community
GET /posts: 최신 의류 공유 피드 조회

POST /community/posts: 커뮤니티 게시글 작성

POST /ai/recommend: (AI) 현재 보고 있는 옷과 유사한 스타일 추천

Direct Message
POST /messages: 1:1 거래 쪽지 발송

GET /messages/inbox: 받은 쪽지함 확인

👨‍💻 Contributors
JChangWan - Full Stack Developer & AI Engineer

📜 License
This project is licensed under the MIT License - see the LICENSE file for details.
