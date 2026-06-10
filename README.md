# 북마크 관리 앱

URL, 제목, 카테고리로 북마크를 저장하고 관리하는 웹 애플리케이션입니다.

## 기능

- **북마크 추가/수정/삭제** — URL, 제목, 카테고리 입력
- **카테고리 자동완성** — 기존 카테고리를 타이핑하며 필터링, 키보드/마우스로 선택
- **카테고리 필터** — 카테고리 버튼으로 목록 필터링
- **제목·URL 검색** — 실시간 검색
- **URL 자동 보완** — `https://` 없이 입력해도 자동 추가
- **URL 형식 검사** — 잘못된 URL 인라인 오류 표시
- **중복 URL 감지** — 이미 저장된 URL 입력 시 인라인 경고 및 덮어쓰기 선택
- **인라인 삭제 확인** — 삭제 버튼 클릭 시 confirm 팝업 대신 인라인 확인
- **파비콘 표시** — 각 사이트 아이콘 자동 로드

## 기술 스택

- **Backend** — Node.js, Express
- **Frontend** — HTML, CSS, Vanilla JS
- **Storage** — JSON 파일 (`data/bookmarks.json`)

## 시작하기

```bash
# 의존성 설치
npm install

# 서버 실행
npm start
```

브라우저에서 http://localhost:3000 접속

## 프로젝트 구조

```
bookmark-app/
├── server.js          # Express 서버 & REST API
├── package.json
├── data/
│   └── bookmarks.json # 북마크 데이터 저장
└── public/
    ├── index.html
    ├── style.css
    └── app.js
```

## API

| Method | Path | 설명 |
|--------|------|------|
| GET | `/api/bookmarks` | 북마크 목록 (`?category=`, `?q=` 파라미터 지원) |
| POST | `/api/bookmarks` | 북마크 추가 |
| PUT | `/api/bookmarks/:id` | 북마크 수정 |
| DELETE | `/api/bookmarks/:id` | 북마크 삭제 |
| GET | `/api/bookmarks/check` | URL 중복 확인 (`?url=`) |
| GET | `/api/categories` | 카테고리 목록 |
