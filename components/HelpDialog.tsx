"use client";

import { useEffect, useRef } from "react";
import { btnPrimary, SensitiveNotice } from "./ui";

const STEPS = [
  ["문서 종류 고르기", "첫 화면에서 만들 문서를 골라요."],
  ["질문에 답하기", "별표(필수) 질문은 꼭 채워요. 오른쪽 미리보기가 바로 바뀌어요."],
  ["자료 올리기 (선택)", "엑셀·워드·텍스트는 내용이 .md 안에 들어가고, 원본도 함께 담겨요."],
  ["결과물 만들기", "practice 폴더 안 '결과물' 폴더에 자동 저장돼요. 필요하면 ZIP으로도 받을 수 있어요."],
  ["AI에 올리기", "저장된 폴더 안 파일을 모두 ChatGPT·Claude 같은 AI에 올려요."],
];

export function HelpDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      className="m-auto w-[min(560px,calc(100%-32px))] rounded-lg bg-canvas p-xl text-body backdrop:bg-surface-dark/50"
    >
      <h2 className="font-display text-display-sm text-ink">사용 방법</h2>
      <ol className="mt-lg flex flex-col gap-md">
        {STEPS.map(([title, desc], i) => (
          <li key={title} className="flex gap-md">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-surface-card text-caption font-medium text-ink">
              {i + 1}
            </span>
            <div>
              <p className="text-title-sm font-medium text-ink">{title}</p>
              <p className="text-body-sm text-muted">{desc}</p>
            </div>
          </li>
        ))}
      </ol>
      <div className="mt-lg flex flex-col gap-sm">
        <SensitiveNotice />
      </div>
      <div className="mt-lg flex justify-end">
        <button type="button" className={btnPrimary} onClick={onClose}>
          알겠어요
        </button>
      </div>
    </dialog>
  );
}
