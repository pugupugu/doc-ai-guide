"use client";

import Link from "next/link";
import { useState } from "react";
import { notify } from "@/lib/notify";
import { attachmentPath } from "@/lib/prompt";
import type { Attachment } from "@/lib/types";
import { buildZip, downloadBlob, PROMPT_FILE, type LocalSaveResult } from "@/lib/zip";
import { btnPrimary, btnSecondary } from "./ui";

type Props = {
  folder: string;
  promptMd: string;
  attachments: Attachment[];
  saved: boolean;
  local: "saving" | LocalSaveResult;
  onRetrySave: () => void;
  onEdit: () => void;
};

function LocalSaveCard({ local, onRetry }: { local: Props["local"]; onRetry: () => void }) {
  if (local === "saving") {
    return (
      <div role="status" className="rounded-lg border border-hairline p-lg">
        <p className="text-title-sm font-medium text-ink">practice 폴더에 저장하는 중…</p>
      </div>
    );
  }

  if (!local.ok && local.unavailable) {
    return (
      <div role="status" className="rounded-lg border border-hairline p-lg">
        <p className="text-title-sm font-medium text-ink">아래 &lsquo;ZIP 내려받기&rsquo;로 받아 주세요</p>
        <p className="mt-xxs text-body-sm text-muted">
          인터넷에 올린 사이트에서는 내 PC 폴더에 바로 저장할 수 없어요. 압축 파일로 받아서 원하는 폴더에 풀면 돼요.
        </p>
      </div>
    );
  }

  if (!local.ok) {
    return (
      <div role="alert" className="rounded-lg border border-error/40 bg-surface-soft p-lg">
        <p className="text-title-sm font-medium text-error">폴더에 저장하지 못했어요</p>
        <p className="mt-xxs text-body-sm text-body">{local.error} 아래 ZIP 내려받기는 그대로 쓸 수 있어요.</p>
        <button type="button" className={`${btnSecondary} mt-md`} onClick={onRetry}>
          다시 저장하기
        </button>
      </div>
    );
  }

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(local.path);
      notify.success("폴더 위치를 복사했어요", { description: "파일 탐색기 주소창에 붙여 넣으세요." });
    } catch {
      notify.error("복사하지 못했어요", { description: "위치를 직접 선택해서 복사해 주세요." });
    }
  };

  return (
    <div role="status" className="rounded-lg border border-hairline p-lg">
      <p className="flex items-center gap-xs text-title-sm font-medium text-ink">
        <span className="h-2 w-2 rounded-full bg-success" aria-hidden />
        practice 폴더에 저장했어요
      </p>
      <p className="mt-xs text-body-sm text-muted">파일 탐색기에서 아래 위치를 열면 바로 볼 수 있어요.</p>
      <div className="mt-sm flex flex-wrap items-center gap-xs">
        <code className="min-w-0 flex-1 rounded-md bg-surface-soft px-sm py-xs font-mono text-code text-ink break-all">
          {local.path}
        </code>
        <button type="button" className={btnSecondary} onClick={copy}>
          위치 복사
        </button>
      </div>
    </div>
  );
}

export function DoneView({ folder, promptMd, attachments, saved, local, onRetrySave, onEdit }: Props) {
  const [busy, setBusy] = useState(false);

  const download = async () => {
    setBusy(true);
    try {
      downloadBlob(await buildZip(folder, promptMd, attachments), `${folder}.zip`);
      notify.success("압축 파일을 내려받았어요", { description: "브라우저의 다운로드 폴더를 확인하세요." });
    } catch {
      notify.error("압축 파일을 만들지 못했어요", { description: "다시 눌러 주세요." });
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="mx-auto max-w-[1200px] px-lg py-xxl">
      <h1 className="font-display text-display-sm text-ink">결과물이 준비되었어요</h1>
      <p className="mt-xs text-body-md text-muted">
        {saved ? "내 기록에도 저장했어요." : "내 기록 저장에 실패했어요. 브라우저 저장 공간을 확인해 주세요."}
      </p>

      <div className="mt-xl grid gap-xl lg:grid-cols-[1fr_440px]">
        <div className="flex flex-col gap-lg">
          <LocalSaveCard local={local} onRetry={onRetrySave} />

          <div className="rounded-lg bg-surface-card p-xl">
            <p className="text-title-md font-medium text-ink">저장된 내용</p>
            <pre className="mt-md font-mono text-code text-body whitespace-pre-wrap">
              {[
                `${folder}/`,
                ` ├─ ${PROMPT_FILE}`,
                ...(attachments.length ? [" └─ 첨부자료/"] : []),
                ...attachments.map((a) => `     · ${attachmentPath(a.name).replace("첨부자료/", "")}`),
              ].join("\n")}
            </pre>
            <p className="mt-md text-body-sm text-muted">
              다른 PC로 옮기거나 동료에게 보낼 때는 압축 파일로 받아 두면 편해요.
            </p>
            <button type="button" className={`${btnPrimary} mt-md`} onClick={download} disabled={busy}>
              {busy ? "만드는 중…" : "ZIP 내려받기"}
            </button>
          </div>

          <div className="rounded-lg border border-hairline p-xl">
            <p className="text-title-md font-medium text-ink">AI에 올리는 방법</p>
            <ol className="mt-md flex flex-col gap-sm text-body-md">
              <li>1. 위 폴더를 열어요 (ZIP으로 받았다면 마우스 오른쪽 클릭 → 압축 풀기)</li>
              <li>
                2. ChatGPT·Claude 등 AI 채팅창에 폴더 안 파일을 <strong className="text-ink">모두</strong> 올려요
              </li>
              <li>3. &ldquo;초안생성프롬프트.md 내용대로 문서를 만들어줘&rdquo;라고 입력해요</li>
            </ol>
          </div>

          <div className="flex flex-wrap gap-sm">
            <button type="button" className={btnSecondary} onClick={onEdit}>
              답변 고쳐서 다시 만들기
            </button>
            <Link href="/" className={btnSecondary}>
              처음으로
            </Link>
          </div>
        </div>

        <div className="rounded-lg bg-surface-dark p-lg text-on-dark">
          <p className="mb-sm text-caption font-medium text-on-dark-soft">{PROMPT_FILE}</p>
          <pre className="max-h-[70vh] overflow-auto rounded-md bg-surface-dark-soft p-md font-mono text-code whitespace-pre-wrap">
            {promptMd}
          </pre>
        </div>
      </div>
    </main>
  );
}
