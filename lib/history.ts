import type { PromptRecord } from "./types";

// "내 기록" 저장소: 이 브라우저(localStorage). 로그인이 없으므로 서버에는 아무것도 저장하지 않는다.
// 첨부 파일 내용은 저장하지 않는다.

// .md 파일로 불러온 답변을 질문 화면에 넘길 때 쓰는 임시 칸
export const IMPORT_KEY = "prompt-site:import";
const STORE_KEY = "prompt-site:records";

export type RecordInput = Omit<PromptRecord, "id" | "createdAt" | "updatedAt"> & { id?: string };

export function recentRecords(records: PromptRecord[], count: number) {
  return [...records].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).slice(0, count);
}

function readAll(): PromptRecord[] | null {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    const data = raw ? JSON.parse(raw) : [];
    return Array.isArray(data) ? (data as PromptRecord[]) : [];
  } catch {
    return null;
  }
}

function writeAll(records: PromptRecord[]): boolean {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(records));
    return true;
  } catch {
    return false;
  }
}

function newId() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `r${Date.now()}${Math.random().toString(36).slice(2, 8)}`;
}

export async function restoreRecord(r: PromptRecord): Promise<boolean> {
  const all = readAll();
  if (!all) return false;
  return writeAll([...all.filter((x) => x.id !== r.id), r]);
}

export async function listRecords(): Promise<PromptRecord[] | null> {
  const all = readAll();
  return all ? recentRecords(all, all.length) : null;
}

export async function getRecord(id: string): Promise<PromptRecord | null> {
  return readAll()?.find((r) => r.id === id) ?? null;
}

export async function saveRecord(input: RecordInput): Promise<PromptRecord | null> {
  const all = readAll();
  if (!all) return null;
  const now = new Date().toISOString();
  const existing = input.id ? all.find((r) => r.id === input.id) : undefined;
  if (input.id && !existing) return null;
  const saved: PromptRecord = { ...input, id: existing?.id ?? newId(), createdAt: existing?.createdAt ?? now, updatedAt: now };
  return writeAll([...all.filter((r) => r.id !== saved.id), saved]) ? saved : null;
}

export async function deleteRecord(id: string): Promise<boolean> {
  const all = readAll();
  if (!all || !all.some((r) => r.id === id)) return false;
  return writeAll(all.filter((r) => r.id !== id));
}
