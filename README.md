# Sprint4 Backend API

Express + Prisma 기반의 백엔드 API 서버입니다. 회원 인증, 상품/게시글 CRUD, 댓글, 좋아요, 이미지 업로드 기능을 제공합니다.

---

## 기술 스택

* **Node.js / Express**
* **Prisma ORM**
* **PostgreSQL**
* **JWT 기반 인증 (Access / Refresh Token)**
* **Swagger (API Docs)**
* **Multer (이미지 업로드)**

---

## 인증 (Auth)

| Method | Endpoint          | Description  |
| ------ | ----------------- | ------------ |
| POST   | /auth/register    | 회원가입         |
| POST   | /auth/login       | 로그인          |
| POST   | /auth/logout      | 로그아웃         |
| GET    | /auth/me          | 내 정보 조회      |
| PATCH  | /auth/me          | 내 정보 수정      |
| PATCH  | /auth/password    | 비밀번호 변경      |
| POST   | /auth/refresh     | 토큰 재발급       |
| GET    | /auth/me/products | 내가 등록한 상품 목록 |

> 로그인 성공 시 Access / Refresh Token이 쿠키로 설정됩니다.

---

## 상품 (Products)

| Method | Endpoint           | Description           |
| ------ | ------------------ | --------------------- |
| POST   | /products          | 상품 등록 (로그인 필요)        |
| GET    | /products          | 상품 목록 조회 (페이지네이션, 검색) |
| GET    | /products/:id      | 상품 상세 조회              |
| PATCH  | /products/:id      | 상품 수정 (본인만 가능)        |
| DELETE | /products/:id      | 상품 삭제 (본인만 가능)        |
| POST   | /products/:id/like | 상품 좋아요 토글             |
| GET    | /products/likes/me | 내가 좋아요한 상품 목록         |

### 상품 댓글

| Method | Endpoint               | Description      |
| ------ | ---------------------- | ---------------- |
| POST   | /products/:id/comments | 댓글 작성            |
| GET    | /products/:id/comments | 댓글 목록 조회 (커서 기반) |
| PATCH  | /comments/:id          | 댓글 수정            |
| DELETE | /comments/:id          | 댓글 삭제            |

---

## 게시글 (Articles)

| Method | Endpoint           | Description |
| ------ | ------------------ | ----------- |
| POST   | /articles          | 게시글 작성      |
| GET    | /articles          | 게시글 목록 조회   |
| GET    | /articles/:id      | 게시글 상세 조회   |
| PATCH  | /articles/:id      | 게시글 수정      |
| DELETE | /articles/:id      | 게시글 삭제      |
| POST   | /articles/:id/like | 게시글 좋아요 토글  |
| GET    | /articles/likes/me | 내가 좋아요한 게시글 |

### 게시글 댓글

| Method | Endpoint               | Description      |
| ------ | ---------------------- | ---------------- |
| POST   | /articles/:id/comments | 댓글 작성            |
| GET    | /articles/:id/comments | 댓글 목록 조회 (커서 기반) |

---

## 이미지 업로드

| Method | Endpoint | Description |
| ------ | -------- | ----------- |
| POST   | /images  | 이미지 업로드     |

* 지원 포맷: `png`, `jpg`, `jpeg`
* 최대 크기: 5MB
* 업로드 성공 시 이미지 URL 반환

---

## 공통 정책

* **인증 필요 API**는 로그인하지 않으면 `401 Unauthorized`
* **본인 소유 리소스**만 수정/삭제 가능 (`403 Forbidden`)
* 존재하지 않는 리소스 접근 시 `404 Not Found`

---

## API 문서 (Swagger)

```text
GET /docs/
```

Swagger UI를 통해 전체 API를 확인할 수 있습니다.

---

## 프로젝트 구조 (요약)

```text
src/
├── controllers/      # 비즈니스 로직 (회원, 상품, 게시글, 댓글, 이미지)
├── routers/          # API 엔드포인트 라우팅
├── classes/          # 엔티티 변환 및 도메인 모델
├── structs/          # Superstruct를 이용한 데이터 유효성 검사 스키마
├── lib/              # 공통 유틸리티 (에러 핸들러, 토큰 관리, 패스포트 설정)
└── main.js           # 애플리케이션 진입점 및 미들웨어 설정
```

---

## 비고

* API 서버 프로젝트입니다.
