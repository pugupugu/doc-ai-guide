"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { allQuestions } from "@/lib/doc-types";
import { setDirty as setGlobalDirty, LEAVE_MESSAGE } from "@/lib/dirty";
import { getRecord, IMPORT_KEY, saveRecord } from "@/lib/history";
import { loadedFor, type Loaded } from "@/lib/loaded";
import { notify } from "@/lib/notify";
import {
  assemblePrompt,
  buildAttachmentSection,
  buildCore,
  buildHiddenData,
  docTitle,
  isAnswered,
  toMeta,
} from "@/lib/prompt";
import type { AnswerValue, Answers, Attachment, AttachmentMeta, DocType } from "@/lib/types";
import { folderName, saveToProjectFolder, type LocalSaveResult } from "@/lib/zip";
import { AttachmentsPanel } from "./AttachmentsPanel";
import { DocIcon } from "./DocIcon";
import { DoneView } from "./DoneView";
import { QuestionField } from "./QuestionField";
import { btnPrimary, btnSecondary, tabClass } from "./ui";

type Initial = { answers: Answers; pending: AttachmentMeta[]; recordId?: string; notice: string };

async function loadInitial(doc: DocType, params: URLSearchParams): Promise<Initial> {
  const empty: Initial = { answers: {}, pending: [], notice: "" };
  const recordId = params.get("record");
  const fromId = params.get("from");
  if (recordId || fromId) {
    const r = await getRecord((recordId ?? fromId)!);
    if (!r || r.docType !== doc.id) return { ...empty, notice: "기록을 찾지 못해서 새로 시작해요." };
    return {
      answers: r.answers,
      pending: r.attachmentsMeta,
      recordId: recordId ? r.id : undefined,
      notice: recordId ? "저장된 기록을 열었어요." : "기록을 복사해서 새로 시작해요.",
    };
  }
  if (params.get("import")) {
    try {
      const data = JSON.parse(sessionStorage.getItem(IMPORT_KEY) ?? "null");
      if (data?.docType === doc.id) {
        return { answers: data.answers, pending: data.attachments ?? [], notice: ".md 파일의 답변을 불러왔어요." };
      }
    } catch {
      // 무시하고 새로 시작
    }
  }
  return empty;
}

export function QuestionWorkspace({ doc }: { doc: DocType }) {
  const params = useSearchParams();
  const query = params.toString();
  const [loaded, setLoaded] = useState<Loaded<Initial>>(null);
  const initial = loadedFor(loaded, query);

  useEffect(() => {
    let alive = true;
    loadInitial(doc, new URLSearchParams(query)).then((value) => {
      if (alive) setLoaded({ key: query, value });
    });
    return () => {
      alive = false;
    };
  }, [doc, query]);

  if (!initial) {
    return (
      <p role="status" className="mx-auto max-w-[1200px] px-lg py-xxl text-body-md text-muted">
        불러오는 중…
      </p>
    );
  }
  return <Workspace key={query} doc={doc} initial={initial} />;
}

function Workspace({ doc, initial }: { doc: DocType; initial: Initial }) {
  const [answers, setAnswers] = useState<Answers>(initial.answers);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [pending, setPending] = useState<AttachmentMeta[]>(initial.pending);
  const [recordId, setRecordId] = useState(initial.recordId);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [activeGroup, setActiveGroup] = useState(doc.groups[0].id);
  const [showPreview, setShowPreview] = useState(false);

  const [done, setDone] = useState<{
    folder: string;
    md: string;
    saved: boolean;
    local: "saving" | LocalSaveResult;
  } | null>(null);

  const questions = allQuestions(doc);
  const required = questions.filter((q) => q.required);
  const missing = required.filter((q) => !isAnswered(answers[q.id]));

  const originalCore = useMemo(() => buildCore(doc, answers), [doc, answers]);
  const core = originalCore;

  const hidden = useMemo(
    () =>
      buildHiddenData({
        docType: doc.id,
        answers,
        attachments: [...toMeta(attachments), ...pending],
        aiRefined: false,
      }),
    [doc.id, answers, attachments, pending],
  );

  const previewMd = assemblePrompt({ core, attachmentSection: buildAttachmentSection(attachments, true) });

  useEffect(() => {
    setGlobalDirty(dirty);
    if (!dirty) return;
    const onUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = LEAVE_MESSAGE;
    };
    window.addEventListener("beforeunload", onUnload);
    return () => window.removeEventListener("beforeunload", onUnload);
  }, [dirty]);

  useEffect(() => {
    sessionStorage.removeItem(IMPORT_KEY);
    // 같은 id라서 개발 모드에서 두 번 실행돼도 알림은 하나만 뜬다
    if (initial.notice) notify.info(initial.notice, { id: "workspace-initial" });
    return () => setGlobalDirty(false);
  }, [initial.notice]);

  const touch = (_answersChanged = true) => {
    setDirty(true);
  };

  const setAnswer = (id: string, value: AnswerValue) => {
    setAnswers((a) => ({ ...a, [id]: value }));
    setErrors((e) => e.filter((x) => x !== id));
    touch();
  };

  const goToGroup = (groupId: string) => {
    setActiveGroup(groupId);
    setCollapsed((c) => ({ ...c, [groupId]: false }));
    document.getElementById(`group-${groupId}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const recordBase = () => ({
    docType: doc.id,
    title: docTitle(answers),
    answers,
    attachmentsMeta: [...toMeta(attachments), ...pending],
    aiRefined: false,
  });

  const saveDraft = async () => {
    setSaving(true);
    const saved = await notify
      .promise(
        saveRecord({
          ...recordBase(),
          id: recordId,
          status: "draft",
          promptMd: assemblePrompt({ core, attachmentSection: buildAttachmentSection(attachments, false), hidden }),
        }),
        {
          loading: "임시 저장하는 중…",
          success: (r) => (r ? "임시 저장했어요" : null),
          error: "저장하지 못했어요. 브라우저 저장 공간이 가득 찼거나 사용할 수 없는 상태예요.",
        },
      )
      .catch(() => null);
    setSaving(false);
    if (!saved) return;
    setRecordId(saved.id);
    setDirty(false);
  };

  const saveFolder = async (folder: string, md: string) => {
    setDone((d) => (d ? { ...d, local: "saving" } : d));
    const result = await saveToProjectFolder(folder, md, attachments);
    setDone((d) => (d ? { ...d, local: result } : d));
  };

  const finish = async () => {
    if (missing.length > 0) {
      setErrors(missing.map((q) => q.id));
      const first = missing[0];
      const group = doc.groups.find((g) => g.questions.includes(first))!;
      setActiveGroup(group.id);
      setCollapsed((c) => ({ ...c, [group.id]: false }));
      notify.error(`꼭 답해야 하는 질문이 ${missing.length}개 남았어요`, {
        id: "missing-required",
        description: `첫 번째: ${first.label}`,
      });
      setTimeout(() => {
        document.getElementById(`field-${first.id}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
        document.getElementById(`q-${first.id}`)?.focus({ preventScroll: true });
      }, 50);
      return;
    }
    const finalMd = assemblePrompt({ core, attachmentSection: buildAttachmentSection(attachments, true), hidden });
    setSaving(true);
    const saved = await saveRecord({
      ...recordBase(),
      id: recordId,
      status: "done",
      promptMd: assemblePrompt({ core, attachmentSection: buildAttachmentSection(attachments, false), hidden }),
    });
    setSaving(false);
    if (saved) setRecordId(saved.id);
    setDirty(false);
    const folder = folderName(docTitle(answers), doc.name);
    setDone({ folder, md: finalMd, saved: !!saved, local: "saving" });
    window.scrollTo({ top: 0 });
    await saveFolder(folder, finalMd);
  };

  if (done) {
    return (
      <DoneView
        folder={done.folder}
        promptMd={done.md}
        attachments={attachments}
        saved={done.saved}
        local={done.local}
        onRetrySave={() => saveFolder(done.folder, done.md)}
        onEdit={() => setDone(null)}
      />
    );
  }

  const previewPanel = (
    <div className="flex flex-col gap-sm">
      <div className="rounded-lg bg-surface-dark p-lg text-on-dark">
        <div className="mb-sm flex items-center justify-between gap-sm">
          <span className="text-caption font-medium text-on-dark-soft">미리보기 · 초안생성프롬프트.md</span>
        </div>
        <pre className="max-h-[60vh] overflow-auto rounded-md bg-surface-dark-soft p-md font-mono text-code whitespace-pre-wrap">
          {previewMd}
        </pre>
      </div>
    </div>
  );

  const togglePreview = () => {
    setShowPreview((v) => !v);
    if (!showPreview) {
      setTimeout(() => document.getElementById("mobile-preview")?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
    }
  };

  const progress = (
    <span className="shrink-0 whitespace-nowrap text-caption text-muted">
      필수 {required.length - missing.length} / {required.length}
    </span>
  );

  return (
    <main className="mx-auto max-w-[1200px] px-md pb-32 pt-xl sm:px-lg sm:pb-xl">
      <h1 className="flex items-center gap-sm font-display text-display-sm text-ink">
        <DocIcon id={doc.id} /> {doc.name}
      </h1>

      {/* 넓은 화면: 탭·진행률·저장 버튼이 한 줄로 위에 붙어 다닌다. 휴대폰: 탭만 가로로 넘기고 같이 스크롤된다 */}
      <div className="z-10 mt-md flex items-center gap-sm border-b border-hairline-soft bg-canvas py-sm sm:sticky sm:top-14">
        <nav aria-label="질문 묶음" className="-mx-xxs flex min-w-0 flex-1 gap-xxs overflow-x-auto px-xxs [scrollbar-width:none]">
          {doc.groups.map((g) => (
            <button key={g.id} type="button" className={tabClass(activeGroup === g.id)} onClick={() => goToGroup(g.id)}>
              {g.title}
            </button>
          ))}
        </nav>
        {progress}
        <div className="hidden shrink-0 gap-sm sm:flex">
          <button type="button" className={`${btnSecondary} lg:hidden`} onClick={togglePreview}>
            {showPreview ? "미리보기 닫기" : "미리보기"}
          </button>
          <button type="button" className={btnSecondary} onClick={saveDraft} disabled={saving}>
            임시 저장
          </button>
          <button type="button" className={btnPrimary} onClick={finish} disabled={saving}>
            결과물 만들기
          </button>
        </div>
      </div>

      {/* 휴대폰: 저장 버튼은 화면 아래에 고정 */}
      <div className="fixed inset-x-0 bottom-0 z-20 flex gap-xs border-t border-hairline bg-canvas px-md pb-[max(12px,env(safe-area-inset-bottom))] pt-sm sm:hidden">
        <button type="button" className={`${btnSecondary} px-md`} onClick={togglePreview} aria-expanded={showPreview}>
          {showPreview ? "닫기" : "미리보기"}
        </button>
        <button type="button" className={`${btnSecondary} px-md`} onClick={saveDraft} disabled={saving}>
          임시 저장
        </button>
        <button type="button" className={`${btnPrimary} flex-1 px-md`} onClick={finish} disabled={saving}>
          결과물 만들기
        </button>
      </div>

      {showPreview && (
        <div id="mobile-preview" className="mt-lg scroll-mt-20 lg:hidden">
          {previewPanel}
        </div>
      )}

      <div className="mt-lg grid gap-xl lg:grid-cols-[1fr_440px]">
        <div className="flex flex-col gap-xl">
          {doc.groups.map((g) => {
            const isCollapsed = collapsed[g.id];
            return (
              <section key={g.id} id={`group-${g.id}`} className="scroll-mt-32">
                <button
                  type="button"
                  onClick={() => setCollapsed((c) => ({ ...c, [g.id]: !isCollapsed }))}
                  aria-expanded={!isCollapsed}
                  className="flex w-full items-center justify-between border-b border-hairline-soft pb-xs text-left"
                >
                  <h2 className="text-title-lg font-medium text-ink">{g.title}</h2>
                  <span className="text-body-sm text-muted">{isCollapsed ? "펼치기 ▾" : "접기 ▴"}</span>
                </button>
                {!isCollapsed && (
                  <div className="mt-lg flex flex-col gap-lg">
                    {g.kind === "attachments" ? (
                      <AttachmentsPanel
                        attachments={attachments}
                        pending={pending}
                        onChange={(next, left) => {
                          setAttachments(next);
                          setPending(left);
                          touch(false);
                        }}
                      />
                    ) : (
                      g.questions.map((q) => (
                        <QuestionField
                          key={q.id}
                          question={q}
                          value={answers[q.id]}
                          error={errors.includes(q.id)}
                          onChange={(v) => setAnswer(q.id, v)}
                        />
                      ))
                    )}
                  </div>
                )}
              </section>
            );
          })}
        </div>
        <aside className="hidden self-start lg:sticky lg:top-36 lg:block">{previewPanel}</aside>
      </div>
    </main>
  );
}
