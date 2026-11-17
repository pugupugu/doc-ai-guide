import { isLocalSite } from "./local";
import { attachmentPath } from "./prompt";
import type { Attachment } from "./types";

export const PROMPT_FILE = "초안생성프롬프트.md";

function safe(name: string) {
  return name.replace(/[\\/:*?"<>|]/g, "").trim() || "문서";
}

export function folderName(title: string, docName: string) {
  return `${safe(title)}_${safe(docName)}`;
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function downloadText(text: string, filename: string) {
  downloadBlob(new Blob([text], { type: "text/markdown;charset=utf-8" }), filename);
}

// unavailable: 배포된 사이트라서 폴더 저장을 쓸 수 없음 (오류가 아님)
export type LocalSaveResult =
  | { ok: true; path: string; relative: string }
  | { ok: false; error: string; unavailable?: boolean };

// 내 PC에서 실행 중일 때 프로젝트 폴더 안 "결과물/"에 저장한다.
// 배포 사이트에서는 아무것도 보내지 않는다 (첨부 파일이 서버로 올라가지 않게).
export async function saveToProjectFolder(
  folder: string,
  promptMd: string,
  attachments: Attachment[],
): Promise<LocalSaveResult> {
  if (!isLocalSite(window.location.host)) return { ok: false, error: "", unavailable: true };
  const form = new FormData();
  form.set("folder", folder);
  form.set("promptMd", promptMd);
  form.set("promptFile", PROMPT_FILE);
  for (const a of attachments) form.append("files", a.file, a.name);
  try {
    const res = await fetch("/api/save-output", { method: "POST", body: form });
    const data = await res.json().catch(() => ({}));
    if (res.status === 403) return { ok: false, error: "", unavailable: true };
    if (!res.ok || typeof data.path !== "string") {
      return { ok: false, error: data.error ?? "폴더에 저장하지 못했어요." };
    }
    return { ok: true, path: data.path, relative: data.relative };
  } catch {
    return { ok: false, error: "폴더에 저장하지 못했어요. 사이트가 켜져 있는지 확인해 주세요." };
  }
}

// ZIP도 브라우저 안에서 만든다
export async function buildZip(folder: string, promptMd: string, attachments: Attachment[]) {
  const JSZip = (await import("jszip")).default;
  const zip = new JSZip();
  const root = zip.folder(folder)!;
  root.file(PROMPT_FILE, promptMd);
  for (const a of attachments) root.file(attachmentPath(a.name), a.file);
  return zip.generateAsync({ type: "blob" });
}
