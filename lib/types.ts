// .md 안에서 답이 들어갈 영역
export type PromptSection = "purpose" | "audience" | "content" | "design" | "rules";

export type QuestionType = "text" | "textarea" | "number" | "select" | "multiselect";

export type Question = {
  id: string;
  label: string;
  // .md에 들어갈 짧은 이름 (없으면 label을 그대로 쓴다)
  promptLabel?: string;
  type: QuestionType;
  section: PromptSection;
  options?: string[];
  required?: boolean;
  placeholder?: string;
  help?: string;
};

export type QuestionGroup = {
  id: string;
  title: string;
  // 첨부자료 묶음은 질문 대신 파일 올리기 칸을 보여준다
  kind?: "attachments";
  questions: Question[];
};

export type DocType = {
  id: string;
  name: string;
  description: string;
  ready: boolean;
  // 결과물 요구사항에 들어갈 최종 파일 형식 설명
  output?: string;
  groups: QuestionGroup[];
};

export type AnswerValue = string | string[];
export type Answers = Record<string, AnswerValue>;

export type AttachmentKind = "content" | "attach";

export type Attachment = {
  id: string;
  name: string;
  size: number;
  kind: AttachmentKind;
  usage: string;
  file: File;
  extracted?: string;
  truncated?: boolean;
};

// 저장·불러오기용 (파일 내용 없음)
export type AttachmentMeta = {
  name: string;
  size?: number;
  kind?: AttachmentKind;
  usage: string;
};

export type PromptRecord = {
  id: string;
  docType: string;
  title: string;
  status: "draft" | "done";
  answers: Answers;
  attachmentsMeta: AttachmentMeta[];
  promptMd: string;
  aiRefined: boolean;
  createdAt: string;
  updatedAt: string;
};
