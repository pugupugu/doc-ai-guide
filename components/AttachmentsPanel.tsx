"use client";

import { useRef, useState } from "react";
import {
  formatSize,
  MAX_FILE_BYTES,
  MAX_TOTAL_BYTES,
  readAttachment,
  uniqueName,
} from "@/lib/attachments";
import type { Attachment, AttachmentMeta } from "@/lib/types";
import { btnSecondary, inputBase, SensitiveNotice } from "./ui";

type Props = {
  attachments: Attachment[];
  pending: AttachmentMeta[];
  onChange: (next: Attachment[], pending: AttachmentMeta[]) => void;
};

export function AttachmentsPanel({ attachments, pending, onChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [dragging, setDragging] = useState(false);

  const addFiles = async (files: File[]) => {
    if (files.length === 0) return;
    setMessage("");
    setBusy(true);
    const next = [...attachments];
    let left = [...pending];
    const skipped: string[] = [];
    let total = next.reduce((s, a) => s + a.size, 0);

    for (const file of files) {
      if (file.size > MAX_FILE_BYTES) {
        skipped.push(`${file.name} (20MB 초과)`);
        continue;
      }
      if (total + file.size > MAX_TOTAL_BYTES) {
        skipped.push(`${file.name} (전체 100MB 초과)`);
        continue;
      }
      const name = uniqueName(file.name, next.map((a) => a.name));
      const item = await readAttachment(file, name);
      const old = left.find((p) => p.name === file.name);
      if (old) {
        item.usage = old.usage;
        left = left.filter((p) => p !== old);
      }
      next.push(item);
      total += file.size;
    }

    setBusy(false);
    if (skipped.length) setMessage(`올리지 못한 파일: ${skipped.join(", ")}`);
    onChange(next, left);
  };

  const update = (id: string, usage: string) =>
    onChange(
      attachments.map((a) => (a.id === id ? { ...a, usage } : a)),
      pending,
    );

  const remove = (id: string) =>
    onChange(
      attachments.filter((a) => a.id !== id),
      pending,
    );

  return (
    <div className="flex flex-col gap-md">
      <SensitiveNotice>
        고객 정보, 개인정보, 비밀번호 등 민감한 자료는 올리지 마세요. 이 파일들은 나중에 외부 AI에 올라갑니다.
      </SensitiveNotice>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          addFiles(Array.from(e.dataTransfer.files));
        }}
        className={`flex flex-col items-center gap-sm rounded-lg border border-dashed p-xl text-center ${
          dragging ? "border-primary bg-surface-soft" : "border-hairline bg-canvas"
        }`}
      >
        <p className="text-body-md text-body">파일을 여기로 끌어다 놓거나</p>
        <button type="button" className={btnSecondary} onClick={() => inputRef.current?.click()} disabled={busy}>
          {busy ? "읽는 중…" : "파일 선택"}
        </button>
        <p className="text-caption text-muted">
          엑셀·CSV·워드·텍스트는 내용이 .md에 함께 들어가요. 파일 하나 20MB, 전체 100MB까지.
        </p>
        <input
          ref={inputRef}
          type="file"
          multiple
          className="hidden"
          onChange={(e) => {
            addFiles(Array.from(e.target.files ?? []));
            e.target.value = "";
          }}
        />
      </div>
      {message && <p className="text-body-sm text-error">{message}</p>}

      {pending.length > 0 && (
        <div className="rounded-md bg-surface-soft p-md">
          <p className="text-body-sm font-medium text-ink">예전에 올렸던 파일이에요. 다시 올려 주세요.</p>
          <ul className="mt-xs text-body-sm text-muted">
            {pending.map((p) => (
              <li key={p.name}>
                · {p.name}
                {p.usage ? ` — ${p.usage}` : ""}
              </li>
            ))}
          </ul>
        </div>
      )}

      {attachments.length > 0 && (
        <ul className="flex flex-col divide-y divide-hairline-soft rounded-lg border border-hairline">
          {attachments.map((a) => (
            <li key={a.id} className="flex flex-col gap-xs p-md">
              <div className="flex flex-wrap items-center gap-xs">
                <span className="text-title-sm font-medium text-ink break-all">{a.name}</span>
                <span className="text-caption text-muted">{formatSize(a.size)}</span>
                <span className="rounded-pill bg-surface-card px-sm py-xxs text-caption font-medium text-ink">
                  {a.kind === "content" ? "내용 포함" : "첨부만"}
                </span>
                {a.truncated && <span className="text-caption text-muted">길어서 앞부분만 넣었어요</span>}
                <button
                  type="button"
                  onClick={() => remove(a.id)}
                  className="ml-auto text-body-sm font-medium text-muted"
                  aria-label={`${a.name} 삭제`}
                >
                  삭제
                </button>
              </div>
              <input
                value={a.usage}
                onChange={(e) => update(a.id, e.target.value)}
                placeholder="이 파일을 어떻게 쓸지 적어 주세요. 예) 3쪽 매출표에 이 숫자를 사용"
                className={`${inputBase} h-10`}
                aria-label={`${a.name} 사용 방법`}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
