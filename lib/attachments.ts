import type { Attachment, AttachmentKind } from "./types";

export const MAX_FILE_BYTES = 20 * 1024 * 1024;
export const MAX_TOTAL_BYTES = 100 * 1024 * 1024;
const MAX_ROWS = 200;
const MAX_CHARS = 20000;

const SHEET_EXT = ["xlsx", "xls", "csv"];
const TEXT_EXT = ["txt", "md"];

function ext(name: string) {
  return name.split(".").pop()?.toLowerCase() ?? "";
}

export function kindOf(name: string): AttachmentKind {
  const e = ext(name);
  return SHEET_EXT.includes(e) || TEXT_EXT.includes(e) || e === "docx" ? "content" : "attach";
}

export function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)}KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)}MB`;
}

// 같은 이름이 있으면 "이름 (2).확장자"로 바꾼다
export function uniqueName(name: string, taken: string[]) {
  if (!taken.includes(name)) return name;
  const dot = name.lastIndexOf(".");
  const base = dot > 0 ? name.slice(0, dot) : name;
  const extension = dot > 0 ? name.slice(dot) : "";
  let i = 2;
  while (taken.includes(`${base} (${i})${extension}`)) i++;
  return `${base} (${i})${extension}`;
}

function cell(v: unknown) {
  return String(v ?? "").replace(/\|/g, "\\|").replace(/\r?\n/g, " ");
}

// 한글 CSV는 UTF-8이거나, 엑셀에서 저장한 경우 EUC-KR(CP949)인 경우가 많다
function decodeText(buffer: ArrayBuffer) {
  try {
    return new TextDecoder("utf-8", { fatal: true }).decode(buffer);
  } catch {
    return new TextDecoder("euc-kr").decode(buffer);
  }
}

async function readSheet(file: File) {
  const XLSX = await import("xlsx");
  const buffer = await file.arrayBuffer();
  const wb =
    ext(file.name) === "csv"
      ? XLSX.read(decodeText(buffer), { type: "string" })
      : XLSX.read(buffer);
  let truncated = false;
  const parts = wb.SheetNames.map((sheetName) => {
    const rows = XLSX.utils.sheet_to_json<unknown[]>(wb.Sheets[sheetName], {
      header: 1,
      blankrows: false,
      defval: "",
    });
    if (rows.length === 0) return `#### ${sheetName}\n\n(빈 시트)`;
    if (rows.length > MAX_ROWS + 1) truncated = true;
    const width = Math.max(...rows.map((r) => r.length));
    const shown = rows.slice(0, MAX_ROWS + 1).map((r) => {
      const filled = Array.from({ length: width }, (_, i) => cell(r[i]));
      return `| ${filled.join(" | ")} |`;
    });
    const divider = `|${" --- |".repeat(width)}`;
    return `#### ${sheetName}\n\n${[shown[0], divider, ...shown.slice(1)].join("\n")}`;
  });
  return { text: parts.join("\n\n"), truncated };
}

async function readDocx(file: File) {
  const mammoth = await import("mammoth");
  const result = await mammoth.extractRawText({ arrayBuffer: await file.arrayBuffer() });
  return result.value;
}

function clip(text: string) {
  const trimmed = text.trim();
  if (trimmed.length <= MAX_CHARS) return { text: trimmed, truncated: false };
  return { text: trimmed.slice(0, MAX_CHARS), truncated: true };
}

function fence(text: string) {
  return "````text\n" + text + "\n````";
}

// 브라우저 안에서만 파일을 읽는다. 서버로 보내지 않는다.
export async function readAttachment(file: File, name: string): Promise<Attachment> {
  const base: Attachment = {
    id: crypto.randomUUID(),
    name,
    size: file.size,
    kind: kindOf(file.name),
    usage: "",
    file,
  };
  if (base.kind === "attach") return base;

  try {
    const e = ext(file.name);
    if (SHEET_EXT.includes(e)) {
      const { text, truncated } = await readSheet(file);
      return { ...base, extracted: text, truncated };
    }
    const raw = e === "docx" ? await readDocx(file) : decodeText(await file.arrayBuffer());
    const { text, truncated } = clip(raw);
    return { ...base, extracted: fence(text), truncated };
  } catch {
    // 읽지 못하면 첨부만 한다
    return { ...base, kind: "attach" };
  }
}
