# bookmarp-app

북마크를 저장·관리하는 단일 페이지 웹 애플리케이션.

## 기술 스택

- **Runtime**: Node.js (CommonJS)
- **Backend**: Express 5.x (`server.js`)
- **Frontend**: Vanilla JS / HTML / CSS (프레임워크 없음)
- **데이터 저장**: `data/bookmarks.json` (파일 기반, DB 없음)

## 실행

```bash
npm start          # node server.js
# http://localhost:3000
```

## 프로젝트 구조

```
server.js                  # Express 서버 + REST API
public/
  index.html               # 단일 페이지 UI
  app.js                   # 프론트엔드 로직 (Vanilla JS)
  style.css                # 스타일
data/
  bookmarks.json           # 북마크 데이터 (JSON 배열)
```

## REST API

| Method | Path | 설명 |
|--------|------|------|
| GET | `/api/bookmarks` | 목록 조회. `?category=`, `?q=` 필터 지원 |
| GET | `/api/bookmarks/check` | URL 중복 확인. `?url=` |
| GET | `/api/categories` | 카테고리 목록 |
| POST | `/api/bookmarks` | 북마크 추가 (body: `url`, `title`, `category`) |
| PUT | `/api/bookmarks/:id` | 북마크 수정 |
| DELETE | `/api/bookmarks/:id` | 북마크 삭제 |

## 데이터 모델

```json
{
  "id": "uuid v4",
  "url": "string (http/https)",
  "title": "string",
  "category": "string (없으면 '미분류')",
  "createdAt": "ISO 8601"
}
```

## 주요 프론트엔드 동작

- **중복 URL 감지**: blur 시 `/api/bookmarks/check` 호출 → 덮어쓰기/유지 선택
- **카테고리 자동완성**: 키보드(↑↓ Enter Escape) 지원
- **URL 정규화**: `https://` 접두사 자동 추가
- **URL 유효성 검사**: `http:`/`https:` 프로토콜, 도메인 dot 포함 여부 확인
- **파비콘**: Google S2 API (`https://www.google.com/s2/favicons?sz=32&domain=...`)
- **인라인 삭제 확인**: 삭제 버튼 클릭 시 같은 행에 확인 UI 표시
- **토스트 알림**: 2.5초 후 자동 사라짐

## 주의사항

- 서버는 `fs.readFileSync` / `fs.writeFileSync`로 동기 I/O 사용 — 동시 쓰기 충돌 위험 있음
- `data/bookmarks.json`이 없거나 JSON이 깨지면 서버가 크래시됨
- 테스트 코드 없음
