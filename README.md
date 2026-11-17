# 문서프롬프트 (doc-ai-guide)

업무 문서(파워포인트·엑셀·워드·이메일·HWP·PDF·MD·도식화·아이콘·이미지)를 AI로 잘 만들 수 있도록,
질문에 답하면 AI 채팅창에 붙여넣을 **초안 생성 프롬프트**를 만들어 주는 페이지입니다.

- 로그인·API 키·서버 없음. 입력 내용은 브라우저 밖으로 나가지 않고, 기록은 각자 브라우저에만 저장됩니다.
- 사용: `index.html`을 열고 문서 종류를 고른 뒤 답하고 **결과 보기 · 복사하기** → AI 채팅창에 붙여넣기.
- 질문 목록을 고칠 때: `lib/doc-types.ts` 수정 후 `node --experimental-strip-types scripts/build-index.mjs`
- GitHub Pages: `main`에 푸시하면 `index.html`이 자동 배포됩니다.
