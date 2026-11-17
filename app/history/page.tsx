"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { DocIcon } from "@/components/DocIcon";
import { AppShell } from "@/components/AppShell";
import { RowMenu } from "@/components/RowMenu";
import { btnSecondary, inputBase, tabClass } from "@/components/ui";
import { DOC_TYPES, getDocType } from "@/lib/doc-types";
import { deleteRecord, listRecords, recentRecords, restoreRecord } from "@/lib/history";
import { notify } from "@/lib/notify";
import type { PromptRecord } from "@/lib/types";
import { downloadText, PROMPT_FILE } from "@/lib/zip";

function History() {
  // undefined = 불러오는 중, null = 불러오기 실패
  const [records, setRecords] = useState<PromptRecord[] | null | undefined>(undefined);
  const [filter, setFilter] = useState("all");
  const [query, setQuery] = useState("");
  const router = useRouter();

  useEffect(() => {
    listRecords().then(setRecords);
  }, []);

  const shown = (records ?? []).filter(
    (r) =>
      (filter === "all" || r.docType === filter) &&
      r.title.toLowerCase().includes(query.trim().toLowerCase()),
  );

  // 확인 창 대신 바로 지우고 "되돌리기"를 준다
  const remove = async (r: PromptRecord) => {
    if (!(await deleteRecord(r.id))) {
      notify.error("삭제하지 못했어요", { description: "잠시 후 다시 시도해 주세요." });
      return;
    }
    setRecords((list) => list?.filter((x) => x.id !== r.id));
    notify.success(`'${r.title}' 기록을 삭제했어요`, {
      action: {
        label: "되돌리기",
        onClick: async () => {
          if (await restoreRecord(r)) {
            setRecords((list) => (list ? recentRecords([...list, r], list.length + 1) : list));
            notify.success("기록을 되살렸어요");
          } else {
            notify.error("되살리지 못했어요");
          }
        },
      },
    });
  };

  return (
    <main className="mx-auto max-w-[1200px] px-lg py-xxl">
      <div className="flex flex-wrap items-end justify-between gap-md">
        <div>
          <h1 className="font-display text-display-sm text-ink">내 기록</h1>
          <p className="mt-xs text-body-md text-muted">
            내가 만든 프롬프트예요. 나만 볼 수 있어요. 첨부 파일은 저장되지 않아요.
          </p>
        </div>
        <Link href="/" className={btnSecondary}>
          새로 만들기
        </Link>
      </div>

      <div className="mt-xl flex flex-wrap items-center gap-sm border-b border-hairline-soft pb-sm">
        <div className="-mx-xxs flex max-w-full gap-xxs overflow-x-auto px-xxs [scrollbar-width:none]">
          <button type="button" className={tabClass(filter === "all")} onClick={() => setFilter("all")}>
            전체
          </button>
          {DOC_TYPES.filter((d) => d.ready).map((d) => (
            <button key={d.id} type="button" className={tabClass(filter === d.id)} onClick={() => setFilter(d.id)}>
              {d.name}
            </button>
          ))}
        </div>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="제목으로 찾기"
          aria-label="제목으로 찾기"
          className={`${inputBase} h-10 sm:ml-auto sm:w-64`}
        />
      </div>

      {records === undefined ? (
        <p role="status" className="mt-xl text-body-md text-muted">
          기록을 불러오는 중…
        </p>
      ) : records === null ? (
        <div role="alert" className="mt-xl rounded-lg border border-error/40 bg-surface-soft p-xl text-center">
          <p className="text-title-md font-medium text-error">기록을 불러오지 못했어요</p>
          <p className="mt-xs text-body-sm text-muted">인터넷 연결을 확인하고 새로고침해 주세요.</p>
        </div>
      ) : shown.length === 0 ? (
        <div className="mt-xl rounded-lg bg-surface-card p-xl text-center">
          <p className="text-title-md font-medium text-ink">
            {records.length === 0 ? "아직 만든 프롬프트가 없어요" : "찾는 기록이 없어요"}
          </p>
          <p className="mt-xs text-body-sm text-muted">질문 화면에서 임시 저장하거나 결과물을 만들면 여기에 쌓여요.</p>
        </div>
      ) : (
        <ul className="mt-lg flex flex-col divide-y divide-hairline-soft rounded-lg border border-hairline">
          {shown.map((r) => {
            const doc = getDocType(r.docType);
            return (
              <li key={r.id} className="flex items-center gap-sm py-xs pl-md pr-xs">
                <DocIcon id={r.docType} size="sm" />
                <Link href={`/new/${r.docType}?record=${r.id}`} className="min-w-0 flex-1 py-xs" aria-label={`${r.title} 열기`}>
                  <div className="flex flex-wrap items-center gap-xs">
                    <span className="text-title-sm font-medium text-ink break-all">{r.title}</span>
                    <span
                      className={`rounded-pill px-sm py-xxs text-caption font-medium ${
                        r.status === "done" ? "bg-surface-card text-ink" : "bg-surface-soft text-muted"
                      }`}
                    >
                      {r.status === "done" ? "완성" : "작성 중"}
                    </span>
                  </div>
                  <p className="text-caption text-muted">
                    {doc?.name} · {new Date(r.updatedAt).toLocaleString("ko-KR")}
                  </p>
                </Link>
                <RowMenu
                  label={`${r.title} 메뉴`}
                  items={[
                    { label: "열기", onSelect: () => router.push(`/new/${r.docType}?record=${r.id}`) },
                    { label: ".md 파일 받기", onSelect: () => downloadText(r.promptMd, PROMPT_FILE) },
                    { label: "복사해서 새로 만들기", onSelect: () => router.push(`/new/${r.docType}?from=${r.id}`) },
                    { label: "삭제", onSelect: () => remove(r), danger: true },
                  ]}
                />
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}

export default function HistoryPage() {
  return <AppShell><History /></AppShell>;
}
