import { allQuestions } from "./doc-types";
import type {
  AnswerValue,
  Answers,
  Attachment,
  AttachmentMeta,
  DocType,
  PromptSection,
} from "./types";

const DATA_MARK = "prompt-builder-data";

export function isAnswered(value: AnswerValue | undefined) {
  if (Array.isArray(value)) return value.length > 0;
  return typeof value === "string" && value.trim() !== "";
}

function formatValue(value: AnswerValue) {
  return Array.isArray(value) ? value.join(", ") : value.trim();
}

function bullet(label: string, value: string) {
  if (!value.includes("\n")) return `- ${label}: ${value}`;
  const lines = value.split("\n").map((l) => `  ${l}`);
  return `- ${label}:\n${lines.join("\n")}`;
}

function sectionLines(doc: DocType, answers: Answers, section: PromptSection) {
  return allQuestions(doc)
    .filter((q) => q.section === section && q.id !== "title" && isAnswered(answers[q.id]))
    .map((q) => bullet(q.promptLabel ?? q.label, formatValue(answers[q.id])));
}

export function docTitle(answers: Answers) {
  const t = answers.title;
  return typeof t === "string" && t.trim() ? t.trim() : "제목 없음";
}

// AI 다듬기 대상이 되는 본문 (첨부자료 영역 제외)
export function buildCore(doc: DocType, answers: Answers) {
  const sections: [string, string[]][] = [
    ["역할", [`너는 ${doc.name} 작성 전문가야. 아래 요구사항에 맞춰 바로 쓸 수 있는 ${doc.name} 초안을 만들어 줘.`]],
    ["목적과 배경", sectionLines(doc, answers, "purpose")],
    ["읽는 사람", sectionLines(doc, answers, "audience")],
    ["구성과 내용", sectionLines(doc, answers, "content")],
    ["디자인과 형식", sectionLines(doc, answers, "design")],
    ["꼭 지킬 것 / 피할 것", sectionLines(doc, answers, "rules")],
    [
      "결과물 요구사항",
      [
        `- 최종 결과물 형식: ${doc.output ?? doc.name}`,
        "- 불확실한 내용은 지어내지 말고 [확인 필요]로 표시할 것",
        "- 완성 후 위 요구사항을 지켰는지 점검 목록을 덧붙일 것",
      ],
    ],
  ];

  let n = 0;
  const body = sections
    .filter(([, lines]) => lines.length > 0)
    .map(([heading, lines]) => `## ${++n}. ${heading}\n${lines.join("\n")}`)
    .join("\n\n");

  return `# 초안 생성 프롬프트: ${docTitle(answers)}\n\n${body}`;
}

export function attachmentPath(name: string) {
  return `첨부자료/${name}`;
}

export function buildAttachmentSection(attachments: Attachment[], includeExtracted: boolean) {
  if (attachments.length === 0) return "";
  const rows = attachments.map(
    (a) => `| ${attachmentPath(a.name).replace(/\|/g, "\\|")} | ${(a.usage.trim() || "참고 자료로 활용").replace(/\|/g, "\\|").replace(/\n/g, " ")} |`,
  );
  let md = `## 첨부자료 사용 방법\n함께 올린 첨부 파일을 아래에 적힌 방법대로 활용해 줘.\n\n| 파일 | 사용 방법 |\n|---|---|\n${rows.join("\n")}`;

  const withText = attachments.filter((a) => a.kind === "content" && a.extracted);
  if (includeExtracted && withText.length > 0) {
    const blocks = withText.map((a) => {
      const note = a.truncated ? "\n\n(이하 생략, 원본 파일 참고)" : "";
      return `### ${a.name}\n\n${a.extracted}${note}`;
    });
    md += `\n\n## 첨부자료 내용 (파일에서 읽어낸 내용)\n\n${blocks.join("\n\n")}`;
  }
  return md;
}

type HiddenData = {
  version: 1;
  docType: string;
  answers: Answers;
  attachments: AttachmentMeta[];
  aiRefined?: boolean;
};

function toBase64(text: string) {
  const bytes = new TextEncoder().encode(text);
  let binary = "";
  bytes.forEach((b) => (binary += String.fromCharCode(b)));
  return btoa(binary);
}

function fromBase64(b64: string) {
  const binary = atob(b64);
  const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

export function buildHiddenData(data: Omit<HiddenData, "version">) {
  const payload: HiddenData = { version: 1, ...data };
  return `<!-- ${DATA_MARK}\n${toBase64(JSON.stringify(payload))}\n-->`;
}

export function parseHiddenData(md: string): HiddenData | null {
  const match = md.match(new RegExp(`<!-- ${DATA_MARK}\\s+([A-Za-z0-9+/=]+)\\s+-->`));
  if (!match) return null;
  try {
    const data = JSON.parse(fromBase64(match[1]));
    if (data?.version !== 1 || typeof data.docType !== "string" || typeof data.answers !== "object") {
      return null;
    }
    return {
      version: 1,
      docType: data.docType,
      answers: data.answers,
      attachments: Array.isArray(data.attachments) ? data.attachments : [],
      aiRefined: !!data.aiRefined,
    };
  } catch {
    return null;
  }
}

export function assemblePrompt(parts: {
  core: string;
  attachmentSection: string;
  hidden?: string;
}) {
  return [parts.core, parts.attachmentSection, parts.hidden].filter(Boolean).join("\n\n") + "\n";
}

export function toMeta(attachments: Attachment[]): AttachmentMeta[] {
  return attachments.map(({ name, size, kind, usage }) => ({ name, size, kind, usage }));
}
