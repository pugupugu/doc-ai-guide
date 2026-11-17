"use client";

import { QuestionWorkspace } from "@/components/QuestionWorkspace";
import { AppShell } from "@/components/AppShell";
import { getDocType } from "@/lib/doc-types";

export function QuestionPage({ docId }: { docId: string }) {
  const doc = getDocType(docId)!;
  return <AppShell><QuestionWorkspace doc={doc} /></AppShell>;
}
