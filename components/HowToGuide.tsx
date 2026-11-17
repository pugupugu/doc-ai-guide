"use client";

import { notify } from "@/lib/notify";
import { btnSecondary } from "./ui";

type Step = {
  title: string;
  where: string;
  optional?: boolean;
  desc: string;
  points: string[];
  tip?: string;
  warn?: string;
};

const STEPS: Step[] = [
  {
    title: "문서 종류 고르기",
    where: "첫 화면",
    desc: "만들고 싶은 문서의 카드를 눌러요. 문서마다 꼭 필요한 질문이 준비되어 있어요.",
    points: [
      "파워포인트·엑셀·워드·이메일·한글·PDF·MD·도식화·아이콘·이미지 10종을 쓸 수 있어요.",
      "예전에 만든 파일을 이어 쓰려면 오른쪽 위 '.md 파일로 불러오기'를 눌러요.",
    ],
  },
  {
    title: "질문에 답하기",
    where: "질문 화면",
    desc: "'필수' 표시가 붙은 질문만 채워도 결과물을 만들 수 있어요. 선택 질문은 채울수록 결과가 좋아져요.",
    points: [
      "위쪽 탭(기본 정보·내용·디자인…)을 누르면 해당 묶음으로 바로 이동해요.",
      "오른쪽 미리보기에 AI에게 줄 지시서가 실시간으로 만들어져요.",
      "중간에 멈출 땐 '임시 저장' → 나중에 '내 기록'에서 이어서 써요.",
    ],
    tip: "숫자·이름·날짜를 구체적으로 적을수록 AI가 지어내지 않고 정확하게 만들어요.",
  },
  {
    title: "자료 올리기",
    where: "질문 화면 '첨부자료' 탭 · 미리보기 아래",
    optional: true,
    desc: "참고할 파일을 올리고, 파일마다 어떻게 쓸지 적어요.",
    points: [
      "엑셀·CSV·워드·텍스트 파일은 내용이 지시서 안에 함께 들어가요.",
      "이미지·PDF·PPT는 파일만 함께 담기고, 어디에 쓸지 한 줄로 적어 두면 돼요.",
    ],
    warn: "고객 정보·개인정보·비밀번호가 담긴 자료는 올리지 마세요. 나중에 외부 AI로 전달돼요.",
  },
  {
    title: "결과물 만들기",
    where: "질문 화면 오른쪽 위 버튼",
    desc: "'결과물 만들기'를 누르면 지시서와 첨부자료가 한 폴더로 정리돼요.",
    points: [
      "프로젝트 폴더 안 '결과물' 폴더에 자동으로 저장돼요.",
      "다른 PC로 옮기거나 동료에게 보낼 땐 'ZIP 내려받기'로 압축 파일을 받아요.",
      "만든 내용은 '내 기록'에도 남아서 언제든 다시 열 수 있어요.",
    ],
  },
  {
    title: "AI에 올려 완성하기",
    where: "ChatGPT · Claude 등 AI 채팅창",
    desc: "저장된 폴더 안의 파일을 모두 AI 채팅창에 올리고, 오른쪽 문장을 붙여 넣어요.",
    points: [
      "초안생성프롬프트.md 와 첨부자료 폴더 안 파일을 빠짐없이 함께 올려요.",
      "AI가 만든 초안에서 [확인 필요] 표시가 있는 곳은 꼭 직접 확인해요.",
    ],
  },
];

const FAQ = [
  ["다른 PC에서 '내 기록'이 안 보여요.", "지금은 쓰고 있는 브라우저에만 저장돼요. 받아 둔 .md 파일을 '.md 파일로 불러오기'로 올리면 이어서 쓸 수 있어요."],
  ["결과물 폴더는 어디에 있나요?", "프로젝트 폴더 안 '결과물' 폴더예요. 완료 화면에서 정확한 위치를 복사할 수 있어요."],
];

const AI_SENTENCE = "초안생성프롬프트.md 내용대로 문서를 만들어줘. 첨부한 파일도 함께 참고해줘.";

const FOLDER_TREE = `practice/
└─ 결과물/
   └─ 3분기 실적 보고_파워포인트/
      ├─ 초안생성프롬프트.md
      └─ 첨부자료/
         ├─ 3분기매출.xlsx
         └─ 회사로고.png`;

export function HowToGuide() {
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(AI_SENTENCE);
      notify.success("문장을 복사했어요", { description: "AI 채팅창에 붙여 넣으세요." });
    } catch {
      notify.error("복사하지 못했어요", { description: "문장을 직접 선택해서 복사해 주세요." });
    }
  };

  return (
    <section aria-labelledby="guide-title" className="mt-section rounded-xl bg-surface-soft px-lg py-xxl sm:px-xxl">
      <h2 id="guide-title" className="font-display text-display-sm text-ink">
        처음이라면, 이 순서대로 따라 해 보세요
      </h2>
      <p className="mt-sm max-w-[640px] text-body-md text-body">
        다섯 단계면 AI에 바로 올릴 수 있는 지시서가 완성돼요. 처음엔 10분, 익숙해지면 5분이면 충분해요.
      </p>

      <div className="mt-xxl grid gap-xxl lg:grid-cols-[1fr_400px]">
        <ol className="flex flex-col">
          {STEPS.map((s, i) => (
            <li key={s.title} className="relative flex gap-lg pb-xl last:pb-0">
              {i < STEPS.length - 1 && (
                <span className="absolute top-12 bottom-0 left-[19px] w-px bg-hairline" aria-hidden />
              )}
              <span className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-hairline bg-canvas font-display text-title-lg text-ink">
                {i + 1}
              </span>
              <div className="min-w-0 flex-1 pt-xxs">
                <div className="flex flex-wrap items-center gap-xs">
                  <h3 className="text-title-lg font-medium text-ink">{s.title}</h3>
                  {s.optional && (
                    <span className="rounded-pill bg-surface-card px-sm py-xxs text-caption font-medium text-ink">
                      선택
                    </span>
                  )}
                </div>
                <p className="mt-xxs text-caption text-muted">위치 · {s.where}</p>
                <p className="mt-sm text-body-md text-body-strong">{s.desc}</p>
                <ul className="mt-sm flex flex-col gap-xxs text-body-sm text-body">
                  {s.points.map((p) => (
                    <li key={p} className="flex gap-xs">
                      <span className="mt-[9px] h-1 w-1 shrink-0 rounded-full bg-muted" aria-hidden />
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
                {s.tip && (
                  <p className="mt-md rounded-md bg-canvas px-md py-sm text-body-sm text-body">
                    <span className="mr-xs font-medium text-primary-ink">TIP</span>
                    {s.tip}
                  </p>
                )}
                {s.warn && (
                  <p className="mt-md rounded-md border border-warning/40 bg-canvas px-md py-sm text-body-sm text-body-strong">
                    <strong className="mr-xs font-medium text-ink">주의</strong>
                    {s.warn}
                  </p>
                )}
              </div>
            </li>
          ))}
        </ol>

        <aside className="flex flex-col gap-lg self-start lg:sticky lg:top-20">
          <div className="rounded-lg bg-surface-dark p-lg text-on-dark">
            <p className="text-caption font-medium text-on-dark-soft">완성되면 이렇게 저장돼요</p>
            <pre className="mt-sm overflow-x-auto rounded-md bg-surface-dark-soft p-md font-mono text-code whitespace-pre">
              {FOLDER_TREE}
            </pre>
            <p className="mt-lg text-caption font-medium text-on-dark-soft">AI 채팅창에 이렇게 말해요</p>
            <p className="mt-sm rounded-md bg-surface-dark-elevated p-md text-body-sm text-on-dark">
              &ldquo;{AI_SENTENCE}&rdquo;
            </p>
            <button
              type="button"
              onClick={copy}
              className={`${btnSecondary} mt-sm w-full border-surface-dark-elevated bg-surface-dark-elevated text-on-dark`}
            >
              문장 복사
            </button>
          </div>

          <div className="rounded-lg bg-canvas p-lg">
            <p className="text-title-md font-medium text-ink">자주 묻는 질문</p>
            <dl className="mt-md flex flex-col gap-md">
              {FAQ.map(([q, a]) => (
                <div key={q}>
                  <dt className="text-body-sm font-medium text-ink">Q. {q}</dt>
                  <dd className="mt-xxs text-body-sm text-muted">{a}</dd>
                </div>
              ))}
            </dl>
          </div>
        </aside>
      </div>
    </section>
  );
}
