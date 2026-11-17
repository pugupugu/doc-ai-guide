"use client";

import Link from "next/link";
import { useState } from "react";
import { confirmLeave, setDirty } from "@/lib/dirty";
import { Wordmark } from "./BrandMark";
import { HelpDialog } from "./HelpDialog";

export function TopNav() {
  const [helpOpen, setHelpOpen] = useState(false);

  const guard = (e: React.MouseEvent) => {
    if (!confirmLeave()) e.preventDefault();
    else setDirty(false);
  };

  return (
    <header className="sticky top-0 z-20 border-b border-hairline-soft bg-canvas">
      <div className="mx-auto flex h-14 max-w-[1200px] items-center justify-between gap-sm whitespace-nowrap px-md sm:px-lg">
        <Link href="/" onClick={guard} aria-label="doc-prompt 처음으로">
          <Wordmark />
        </Link>
        <nav className="flex items-center gap-sm text-body-sm font-medium text-ink sm:gap-lg">
          <button type="button" onClick={() => setHelpOpen(true)}>
            사용 방법
          </button>
          <Link href="/history" onClick={guard}>
            내 기록
          </Link>
        </nav>
      </div>
      <HelpDialog open={helpOpen} onClose={() => setHelpOpen(false)} />
    </header>
  );
}
