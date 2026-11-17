import type { DocType, Question, QuestionGroup } from "./types";

// 문서 종류별 질문 목록. 여기서 관리한다.

const TONES = ["격식체 (~합니다)", "개조식 (~함)", "부드러운 존댓말", "친근한 말투"];

const basicGroup = (audienceHint: string): QuestionGroup => ({
  id: "basic",
  title: "기본 정보",
  questions: [
    {
      id: "title",
      label: "문서 제목",
      type: "text",
      section: "purpose",
      required: true,
      placeholder: "예) 3분기 실적 보고",
    },
    {
      id: "purpose",
      label: "이 문서로 이루고 싶은 것",
      promptLabel: "목적",
      type: "textarea",
      section: "purpose",
      required: true,
      placeholder: "예) 임원진에게 3분기 성과를 보고하고 4분기 예산 승인을 받는다",
    },
    {
      id: "background",
      label: "배경 설명",
      promptLabel: "배경",
      type: "textarea",
      section: "purpose",
      placeholder: "예) 신규 고객이 늘어 매출이 12% 성장했다",
      help: "AI가 상황을 이해할 수 있게 짧게 적어 주세요.",
    },
    {
      id: "audience",
      label: "읽는 사람 (받는 사람)",
      promptLabel: "대상",
      type: "text",
      section: "audience",
      required: true,
      placeholder: audienceHint,
    },
    {
      id: "audience_level",
      label: "읽는 사람이 이 내용을 얼마나 알고 있나요?",
      promptLabel: "대상의 이해 수준",
      type: "select",
      section: "audience",
      options: ["처음 접함", "대략 알고 있음", "잘 알고 있음 (전문가)"],
    },
  ],
});

const attachmentsGroup: QuestionGroup = {
  id: "attachments",
  title: "첨부자료",
  kind: "attachments",
  questions: [],
};

const extraGroup: QuestionGroup = {
  id: "extra",
  title: "기타 요청",
  questions: [
    {
      id: "must_include",
      label: "꼭 지켜야 할 것",
      type: "textarea",
      section: "rules",
      placeholder: "예) 회사 이름은 '인크로스'로 표기, 숫자는 억 단위",
    },
    {
      id: "avoid",
      label: "피해야 할 것",
      type: "textarea",
      section: "rules",
      placeholder: "예) 과장된 표현, 영어 약어 남발",
    },
    {
      id: "extra",
      label: "그 밖에 하고 싶은 말",
      type: "textarea",
      section: "rules",
      placeholder: "예) 초안을 2가지 버전으로 만들어 줘",
    },
  ],
};

const q = (question: Question) => question;

export const DOC_TYPES: DocType[] = [
  {
    id: "ppt",
    name: "파워포인트",
    description: "보고서, 제안서, 발표 자료",
    ready: true,
    output:
      ".pptx 파일. 파일을 만들 수 없다면 장마다 제목, 본문, 시각 자료(차트·표·이미지) 지시, 발표자 노트를 정리해 줘.",
    groups: [
      basicGroup("예) 임원진, 팀 전체, 고객사 담당자"),
      {
        id: "content",
        title: "내용",
        questions: [
          q({ id: "slide_count", label: "몇 장 정도로 만들까요?", promptLabel: "장수", type: "number", section: "content", required: true, placeholder: "10", help: "발표 10분 기준 약 8~10장이에요." }),
          q({ id: "duration", label: "발표 시간", type: "text", section: "content", placeholder: "예) 10분" }),
          q({ id: "structure", label: "장별 구성", type: "textarea", section: "content", required: true, placeholder: "예) 1장 표지 / 2장 요약 / 3~5장 실적 / 6장 다음 계획", help: "모르면 큰 흐름만 적어도 돼요. AI가 나머지를 채워요." }),
          q({ id: "key_message", label: "가장 전하고 싶은 한 마디", promptLabel: "핵심 메시지", type: "text", section: "content", placeholder: "예) 3분기는 목표를 넘었고, 4분기엔 신규 시장에 집중한다" }),
          q({ id: "numbers", label: "꼭 들어갈 숫자·데이터", type: "textarea", section: "content", placeholder: "예) 매출 120억(전년 대비 +12%), 신규 고객 35곳" }),
        ],
      },
      {
        id: "design",
        title: "디자인·형식",
        questions: [
          q({ id: "mood", label: "디자인 분위기", type: "select", section: "design", options: ["깔끔한 비즈니스", "따뜻하고 친근한", "강렬하고 임팩트 있는", "미니멀"] }),
          q({ id: "colors", label: "쓰고 싶은 색", type: "text", section: "design", placeholder: "예) 남색과 주황 포인트" }),
          q({ id: "visuals", label: "넣고 싶은 시각 자료", type: "multiselect", section: "design", options: ["막대 차트", "꺾은선 차트", "원형 차트", "표", "아이콘", "사진"] }),
          q({ id: "tone", label: "글 말투", type: "select", section: "design", options: TONES }),
          q({ id: "ratio", label: "화면 비율", type: "select", section: "design", options: ["16:9 (와이드)", "4:3"] }),
        ],
      },
      attachmentsGroup,
      extraGroup,
    ],
  },
  {
    id: "excel",
    name: "엑셀",
    description: "데이터 정리, 예산표, 일정표",
    ready: true,
    output:
      ".xlsx 파일. 파일을 만들 수 없다면 시트별 표(마크다운 표)와 셀에 넣을 계산식을 정리해 줘.",
    groups: [
      basicGroup("예) 팀원 전체, 재무팀"),
      {
        id: "content",
        title: "내용",
        questions: [
          q({ id: "sheets", label: "시트 구성", type: "textarea", section: "content", required: true, placeholder: "예) 1. 월별 예산 / 2. 부서별 합계 / 3. 차트" }),
          q({ id: "columns", label: "열(항목) 목록", type: "textarea", section: "content", required: true, placeholder: "예) 월, 부서, 항목, 예산, 실제 사용액, 차이" }),
          q({ id: "formulas", label: "필요한 계산", type: "textarea", section: "content", placeholder: "예) 차이 = 예산 - 실제 사용액, 사용률(%)" }),
          q({ id: "totals", label: "합계", type: "select", section: "content", options: ["합계만", "소계와 합계", "필요 없음"] }),
          q({ id: "sample_rows", label: "예시 데이터 줄 수", type: "number", section: "content", placeholder: "10", help: "빈 양식만 원하면 0으로 적어 주세요." }),
        ],
      },
      {
        id: "design",
        title: "디자인·형식",
        questions: [
          q({ id: "features", label: "넣을 기능", type: "multiselect", section: "design", options: ["첫 줄 고정", "필터", "드롭다운 선택칸", "인쇄 영역 설정", "시트 보호"] }),
          q({ id: "conditional", label: "색으로 강조할 조건", type: "textarea", section: "design", placeholder: "예) 사용률 100% 넘으면 빨간색" }),
          q({ id: "charts", label: "넣고 싶은 차트", type: "multiselect", section: "design", options: ["막대 차트", "꺾은선 차트", "원형 차트", "필요 없음"] }),
          q({ id: "number_format", label: "숫자 표시 방식", type: "text", section: "design", placeholder: "예) 천 단위 쉼표, 원 단위" }),
        ],
      },
      attachmentsGroup,
      extraGroup,
    ],
  },
  {
    id: "word",
    name: "워드",
    description: "기획서, 보고서, 공문, 회의록",
    ready: true,
    output: ".docx 파일. 파일을 만들 수 없다면 제목 구조가 살아 있는 완성 원고로 써 줘.",
    groups: [
      basicGroup("예) 부서장, 협력사 담당자"),
      {
        id: "content",
        title: "내용",
        questions: [
          q({ id: "doc_form", label: "문서 양식", type: "select", section: "content", required: true, options: ["보고서", "기획서", "공문", "회의록", "안내문", "기타"] }),
          q({ id: "outline", label: "목차", type: "textarea", section: "content", required: true, placeholder: "예) 1. 개요 / 2. 현황 / 3. 문제점 / 4. 개선안 / 5. 일정" }),
          q({ id: "pages", label: "분량 (쪽)", promptLabel: "분량(쪽)", type: "number", section: "content", placeholder: "3" }),
          q({ id: "key_points", label: "꼭 담을 내용", type: "textarea", section: "content", placeholder: "예) 개선안은 3가지, 각각 비용과 효과 포함" }),
        ],
      },
      {
        id: "design",
        title: "디자인·형식",
        questions: [
          q({ id: "tone", label: "글 말투", type: "select", section: "design", options: TONES }),
          q({ id: "elements", label: "넣을 요소", type: "multiselect", section: "design", options: ["표", "머리말/꼬리말", "쪽 번호", "자동 목차", "각주"] }),
          q({ id: "font", label: "글자 크기·글꼴 규칙", type: "text", section: "design", placeholder: "예) 본문 11pt, 제목 14pt 굵게" }),
        ],
      },
      attachmentsGroup,
      extraGroup,
    ],
  },
  {
    id: "email",
    name: "이메일",
    description: "업무 메일, 안내 메일",
    ready: true,
    output: "메일 제목과 본문. 바로 복사해 붙여넣을 수 있게 써 줘.",
    groups: [
      basicGroup("예) 마케팅팀 김과장님"),
      {
        id: "content",
        title: "내용",
        questions: [
          q({ id: "relation", label: "받는 사람과의 관계", type: "select", section: "content", required: true, options: ["상사", "동료", "다른 부서", "고객사", "외부 협력사"] }),
          q({ id: "request", label: "전달하거나 요청할 내용", type: "textarea", section: "content", required: true, placeholder: "예) 다음 주 회의 자료를 금요일까지 보내 달라고 요청" }),
          q({ id: "deadline", label: "회신 기한", type: "text", section: "content", placeholder: "예) 10월 30일(금) 오후 3시" }),
          q({ id: "cc", label: "참조할 사람", type: "text", section: "content", placeholder: "예) 팀장님" }),
        ],
      },
      {
        id: "design",
        title: "디자인·형식",
        questions: [
          q({ id: "tone", label: "말투", type: "select", section: "design", options: ["정중한 격식체", "부드러운 존댓말", "간결한 업무체"] }),
          q({ id: "length", label: "길이", type: "select", section: "design", options: ["3줄 이내", "짧게 (5~8줄)", "자세하게"] }),
          q({ id: "subject", label: "메일 제목", type: "select", section: "design", options: ["제목도 만들어 줘", "본문만"] }),
        ],
      },
      attachmentsGroup,
      extraGroup,
    ],
  },
  {
    id: "hwp",
    name: "한글(HWP)",
    description: "공문, 내부 보고서",
    ready: true,
    output:
      "한글(HWP)에 그대로 붙여 넣을 수 있는 완성 원고. 표는 칸이 맞게 정리하고, 제목·번호 체계(1. → 가. → 1))를 지켜 줘. .hwp 파일을 만들 수 있으면 파일로도 줘.",
    groups: [
      basicGroup("예) 유관 부서장, 대외 기관 담당자"),
      {
        id: "content",
        title: "내용",
        questions: [
          q({ id: "doc_form", label: "문서 양식", type: "select", section: "content", required: true, options: ["공문(시행문)", "내부 보고서", "기안문", "결과 보고서", "계획서", "기타"] }),
          q({ id: "outline", label: "목차·항목", type: "textarea", section: "content", required: true, placeholder: "예) 1. 추진 배경 / 2. 현황 / 3. 추진 계획 / 4. 협조 요청 사항" }),
          q({ id: "official_items", label: "공문에 들어갈 항목", type: "multiselect", section: "content", options: ["문서 번호", "시행 일자", "수신·참조", "결재란", "붙임 목록", "발신 명의"], help: "공문이 아니면 비워 두세요." }),
          q({ id: "pages", label: "분량 (쪽)", promptLabel: "분량(쪽)", type: "number", section: "content", placeholder: "2" }),
          q({ id: "key_points", label: "꼭 담을 내용", type: "textarea", section: "content", placeholder: "예) 협조 요청 기한 11월 10일, 담당자 연락처" }),
        ],
      },
      {
        id: "design",
        title: "디자인·형식",
        questions: [
          q({ id: "tone", label: "글 말투", type: "select", section: "design", options: ["공문체 (~함, ~바람)", ...TONES] }),
          q({ id: "numbering", label: "번호 체계", type: "select", section: "design", options: ["1. → 가. → 1)", "Ⅰ. → 1. → 가.", "번호 없이"] }),
          q({ id: "font", label: "글자 크기·글꼴 규칙", type: "text", section: "design", placeholder: "예) 본문 휴먼명조 13pt, 줄간격 160%" }),
          q({ id: "tables", label: "표 사용", type: "select", section: "design", options: ["표를 적극적으로 사용", "필요한 곳만", "표 없이 글로만"] }),
        ],
      },
      attachmentsGroup,
      extraGroup,
    ],
  },
  {
    id: "pdf",
    name: "PDF",
    description: "배포용 자료, 안내문",
    ready: true,
    output:
      "PDF로 저장할 수 있는 완성 문서. 파일을 만들 수 없다면 쪽마다 들어갈 제목·본문·배치(레이아웃) 지시를 정리해 줘. 인쇄해도 깨지지 않게 여백과 글자 크기를 정해 줘.",
    groups: [
      basicGroup("예) 전 직원, 신규 입사자, 고객사"),
      {
        id: "content",
        title: "내용",
        questions: [
          q({ id: "pdf_kind", label: "자료 종류", type: "select", section: "content", required: true, options: ["안내문", "소개서·브로슈어", "보고서", "매뉴얼", "포스터·전단", "기타"] }),
          q({ id: "page_count", label: "쪽 수", type: "number", section: "content", required: true, placeholder: "4" }),
          q({ id: "outline", label: "쪽별 구성", type: "textarea", section: "content", required: true, placeholder: "예) 1쪽 표지 / 2쪽 핵심 안내 / 3쪽 일정 / 4쪽 문의처" }),
          q({ id: "key_points", label: "꼭 담을 내용", type: "textarea", section: "content", placeholder: "예) 신청 기간 11/1~11/15, 문의 내선 1234" }),
        ],
      },
      {
        id: "design",
        title: "디자인·형식",
        questions: [
          q({ id: "paper", label: "용지", type: "select", section: "design", options: ["A4 세로", "A4 가로", "화면용 16:9"] }),
          q({ id: "usage", label: "주로 보는 방법", type: "select", section: "design", options: ["인쇄해서 배포", "메일·메신저로 화면에서 봄", "둘 다"] }),
          q({ id: "mood", label: "디자인 분위기", type: "select", section: "design", options: ["깔끔한 비즈니스", "따뜻하고 친근한", "강렬하고 임팩트 있는", "미니멀"] }),
          q({ id: "colors", label: "쓰고 싶은 색", type: "text", section: "design", placeholder: "예) 회사 남색 + 회색" }),
          q({ id: "tone", label: "글 말투", type: "select", section: "design", options: TONES }),
        ],
      },
      attachmentsGroup,
      extraGroup,
    ],
  },
  {
    id: "md",
    name: "MD 파일",
    description: "매뉴얼, 위키, 정리 노트",
    ready: true,
    output:
      "마크다운(.md) 원문. 제목(#), 목록(-), 표(|), 코드 블록(```)을 마크다운 문법 그대로 써서 복사해 바로 저장할 수 있게 해 줘.",
    groups: [
      basicGroup("예) 팀 신규 입사자, 개발자, 전 직원"),
      {
        id: "content",
        title: "내용",
        questions: [
          q({ id: "md_kind", label: "문서 종류", type: "select", section: "content", required: true, options: ["업무 매뉴얼", "사내 위키 문서", "회의·학습 정리 노트", "README(프로젝트 소개)", "FAQ", "기타"] }),
          q({ id: "outline", label: "제목 구조(목차)", type: "textarea", section: "content", required: true, placeholder: "예) 개요 / 준비물 / 단계별 방법 / 자주 하는 실수 / 문의처" }),
          q({ id: "length", label: "분량", type: "select", section: "content", options: ["짧게 (한 화면)", "보통 (2~3 화면)", "자세하게"] }),
          q({ id: "key_points", label: "꼭 담을 내용", type: "textarea", section: "content", placeholder: "예) 신청 화면 주소, 승인까지 걸리는 시간" }),
        ],
      },
      {
        id: "design",
        title: "디자인·형식",
        questions: [
          q({ id: "elements", label: "넣을 요소", type: "multiselect", section: "design", options: ["목차", "표", "체크리스트", "코드 블록", "주의·팁 상자", "링크 모음"] }),
          q({ id: "level", label: "설명 수준", type: "select", section: "design", options: ["처음 보는 사람도 따라 할 수 있게", "핵심만 간단히", "전문가용"] }),
          q({ id: "tone", label: "글 말투", type: "select", section: "design", options: TONES }),
        ],
      },
      attachmentsGroup,
      extraGroup,
    ],
  },
  {
    id: "diagram",
    name: "도식화 자료",
    description: "흐름도, 조직도, 구조도",
    ready: true,
    output:
      "Mermaid 코드로 된 도식 (```mermaid 블록). 그대로 그릴 수 없다면 상자·화살표 목록과 배치 설명을 함께 줘. 상자 글자는 짧게(15자 이내) 써 줘.",
    groups: [
      basicGroup("예) 임원 보고, 신규 입사자 교육"),
      {
        id: "content",
        title: "내용",
        questions: [
          q({ id: "diagram_kind", label: "도식 종류", type: "select", section: "content", required: true, options: ["업무 흐름도", "조직도", "시스템 구조도", "마인드맵", "타임라인·일정", "비교표·매트릭스"] }),
          q({ id: "elements", label: "들어갈 단계·요소", type: "textarea", section: "content", required: true, placeholder: "예) 신청 → 팀장 승인 → 인사팀 검토 → 완료", help: "순서가 있으면 화살표(→)로 적어 주세요." }),
          q({ id: "relations", label: "연결 관계·갈림길", type: "textarea", section: "content", placeholder: "예) 팀장이 반려하면 다시 신청으로 돌아감" }),
          q({ id: "groups", label: "묶을 그룹(구역)", type: "text", section: "content", placeholder: "예) 신청자 / 팀장 / 인사팀으로 칸 나누기" }),
        ],
      },
      {
        id: "design",
        title: "디자인·형식",
        questions: [
          q({ id: "direction", label: "방향", type: "select", section: "design", options: ["위에서 아래로", "왼쪽에서 오른쪽으로", "가운데에서 바깥으로"] }),
          q({ id: "style", label: "모양", type: "select", section: "design", options: ["단순한 상자와 화살표", "색으로 구역 구분", "아이콘 포함"] }),
          q({ id: "colors", label: "쓰고 싶은 색", type: "text", section: "design", placeholder: "예) 단계마다 다른 파스텔 색" }),
        ],
      },
      attachmentsGroup,
      extraGroup,
    ],
  },
  {
    id: "icon",
    name: "아이콘",
    description: "서비스·문서용 아이콘",
    ready: true,
    output:
      "아이콘마다 SVG 코드(24×24 기준, viewBox 포함). 그릴 수 없다면 이미지 생성 AI에 넣을 영어 프롬프트를 아이콘마다 한 줄씩 써 줘.",
    groups: [
      basicGroup("예) 사내 서비스 사용자, 발표 청중"),
      {
        id: "content",
        title: "내용",
        questions: [
          q({ id: "icon_list", label: "만들 아이콘과 의미", type: "textarea", section: "content", required: true, placeholder: "예) 결재(도장) / 일정(달력) / 알림(종) / 설정(톱니바퀴)", help: "아이콘마다 '이름(뜻)'으로 적어 주세요." }),
          q({ id: "count", label: "개수", type: "number", section: "content", placeholder: "4" }),
          q({ id: "where", label: "쓸 곳", type: "select", section: "content", required: true, options: ["웹·앱 화면 메뉴", "발표 자료", "문서·보고서", "인쇄물"] }),
        ],
      },
      {
        id: "design",
        title: "디자인·형식",
        questions: [
          q({ id: "style", label: "스타일", type: "select", section: "design", options: ["선(라인)", "면(채움)", "선+포인트 색", "둥근 손그림 느낌"] }),
          q({ id: "colors", label: "색", type: "text", section: "design", placeholder: "예) 검정 한 가지, 포인트만 주황" }),
          q({ id: "size", label: "크기", type: "select", section: "design", options: ["24px", "32px", "48px", "64px 이상"] }),
          q({ id: "consistency", label: "통일할 점", type: "text", section: "design", placeholder: "예) 선 굵기 2px, 모서리 둥글게" }),
        ],
      },
      attachmentsGroup,
      extraGroup,
    ],
  },
  {
    id: "image",
    name: "이미지",
    description: "표지, 삽화, 배너",
    ready: true,
    output:
      "이미지 1장(또는 요청한 장수). 직접 그릴 수 없다면 이미지 생성 AI에 넣을 상세 프롬프트(한국어 설명 + 영어 프롬프트)를 써 줘.",
    groups: [
      basicGroup("예) 사내 게시판을 보는 직원, 행사 참가자"),
      {
        id: "content",
        title: "내용",
        questions: [
          q({ id: "image_use", label: "용도", type: "select", section: "content", required: true, options: ["보고서·PPT 표지", "본문 삽화", "웹·SNS 배너", "포스터", "썸네일", "기타"] }),
          q({ id: "subject", label: "들어갈 장면·요소", type: "textarea", section: "content", required: true, placeholder: "예) 회의실에서 노트북을 보며 웃는 직원 3명, 창밖은 오후 햇살" }),
          q({ id: "text_in_image", label: "이미지 안에 넣을 글자", type: "text", section: "content", placeholder: "예) 2026 하반기 워크숍", help: "글자가 없으면 비워 두세요. AI는 글자를 틀리게 그리기도 해요." }),
          q({ id: "avoid_elements", label: "넣지 말아야 할 것", type: "text", section: "content", placeholder: "예) 실제 인물 얼굴, 경쟁사 로고" }),
        ],
      },
      {
        id: "design",
        title: "디자인·형식",
        questions: [
          q({ id: "ratio", label: "크기·비율", type: "select", section: "design", options: ["16:9 (가로)", "4:3", "1:1 (정사각형)", "9:16 (세로)", "A4 세로"] }),
          q({ id: "art_style", label: "그림체", type: "select", section: "design", options: ["실사 사진", "깔끔한 일러스트", "3D 렌더", "수채화", "플랫 디자인"] }),
          q({ id: "mood", label: "분위기", type: "select", section: "design", options: ["밝고 활기찬", "차분하고 신뢰감 있는", "고급스러운", "따뜻하고 친근한"] }),
          q({ id: "colors", label: "주요 색", type: "text", section: "design", placeholder: "예) 크림색 바탕에 주황 포인트" }),
        ],
      },
      attachmentsGroup,
      extraGroup,
    ],
  },
];

export function getDocType(id: string) {
  return DOC_TYPES.find((d) => d.id === id);
}

export function allQuestions(doc: DocType) {
  return doc.groups.flatMap((g) => g.questions);
}
