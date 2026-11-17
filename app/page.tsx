"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { DocIcon } from "@/components/DocIcon";
import { HowToGuide } from "@/components/HowToGuide";
import { AppShell } from "@/components/AppShell";
import { btnSecondary, textLink } from "@/components/ui";
import { DOC_TYPES, getDocType } from "@/lib/doc-types";
import { IMPORT_KEY, listRecords, recentRecords } from "@/lib/history";
import { notify } from "@/lib/notify";
import { parseHiddenData } from "@/lib/prompt";
import type { PromptRecord } from "@/lib/types";

// 자주 쓰는 4종은 크게, 나머지는 가벼운 목록으로
const MAIN_TYPES = ["ppt", "excel", "word", "email"];

function RecentList({ records }: { records: PromptRecord[] }) {
  return (
    <section aria-labelledby="recent-title" className="mt-xl">
      <div className="flex items-baseline justify-between gap-md">
        <h2 id="recent-title" className="text-title-md font-medium text-ink">
          이어서 쓰기
        </h2>
        <Link href="/history" className={`${textLink} text-body-sm`}>
          내 기록 전체 보기
        </Link>
      </div>
      {/* 기록 수만큼만 칸을 나눠서 빈 칸이 남지 않게 한다 */}
      <ul className={`mt-sm grid gap-sm ${["", "md:grid-cols-1", "md:grid-cols-2", "md:grid-cols-3"][records.length]}`}>
        {records.map((r) => (
          <li key={r.id}>
            <Link
              href={`/new/${r.docType}?record=${r.id}`}
              className="flex h-full items-center gap-sm rounded-lg bg-surface-card px-md py-sm active:bg-surface-cream-strong"
            >
              <DocIcon id={r.docType} plain />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-title-sm font-medium text-ink">{r.title}</span>
                <span className="block text-caption text-muted">
                  {getDocType(r.docType)?.name} · {r.status === "done" ? "완성" : "작성 중"} ·{" "}
                  {new Date(r.updatedAt).toLocaleDateString("ko-KR")}
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

function Home() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [recent, setRecent] = useState<PromptRecord[]>([]);

  useEffect(() => {
    listRecords().then((list) => setRecent(list ? recentRecords(list, 3) : []));
  }, []);

  const importMd = async (file: File | undefined) => {
    if (!file) return;
    const data = parseHiddenData(await file.text());
    if (!data) {
      notify.error("이 사이트에서 만든 파일이 아니에요", { description: "받았던 초안생성프롬프트.md 파일을 올려 주세요." });
      return;
    }
    if (!getDocType(data.docType)?.ready) {
      notify.error("아직 준비 중인 문서 종류예요");
      return;
    }
    sessionStorage.setItem(IMPORT_KEY, JSON.stringify(data));
    router.push(`/new/${data.docType}?import=1`);
  };

  const main = DOC_TYPES.filter((d) => MAIN_TYPES.includes(d.id));
  const others = DOC_TYPES.filter((d) => !MAIN_TYPES.includes(d.id));

  return (
    <main className="mx-auto max-w-[1200px] px-md py-xxl sm:px-lg">
      <div className="flex flex-wrap items-end justify-between gap-md">
        <div>
          <h1 className="font-display text-display-sm text-ink">어떤 문서를 만들까요?</h1>
          <p className="mt-xs text-body-md text-muted">
            고르면 바로 질문 화면으로 넘어가요. 답을 다 쓰면 AI에 올릴 파일을 만들어 드려요.
          </p>
        </div>
        <div>
          <button type="button" className={btnSecondary} onClick={() => fileRef.current?.click()}>
            .md 파일로 불러오기
          </button>
          <input
            ref={fileRef}
            type="file"
            accept=".md,text/markdown"
            className="hidden"
            onChange={(e) => {
              importMd(e.target.files?.[0]);
              e.target.value = "";
            }}
          />
        </div>
      </div>

      {recent.length > 0 && <RecentList records={recent} />}

      <section aria-labelledby="main-types" className="mt-xl">
        <h2 id="main-types" className="sr-only">
          자주 쓰는 문서
        </h2>
        <div className="grid gap-sm sm:grid-cols-2 lg:grid-cols-4">
          {main.map((d) => (
            <Link
              key={d.id}
              href={`/new/${d.id}`}
              className="flex flex-col gap-md rounded-lg border border-hairline bg-canvas p-lg active:bg-surface-soft"
            >
              <DocIcon id={d.id} />
              <span>
                <span className="block text-title-md font-medium text-ink">{d.name}</span>
                <span className="mt-xxs block text-body-sm text-muted">{d.description}</span>
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section aria-labelledby="other-types" className="mt-xl">
        <h2 id="other-types" className="text-title-md font-medium text-ink">
          다른 문서
        </h2>
        <ul className="mt-sm grid gap-x-xl sm:grid-cols-2 lg:grid-cols-3">
          {others.map((d) => (
            <li key={d.id} className="border-b border-hairline-soft">
              <Link href={`/new/${d.id}`} className="flex items-center gap-sm py-sm active:bg-surface-soft">
                <DocIcon id={d.id} plain />
                <span className="text-title-sm font-medium text-ink">{d.name}</span>
                <span className="truncate text-body-sm text-muted">{d.description}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <HowToGuide />
    </main>
  );
}

export default function HomePage() {
  return <AppShell><Home /></AppShell>;
}
