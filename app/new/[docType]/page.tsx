import { notFound } from "next/navigation";
import { Suspense } from "react";
import { QuestionPage } from "./QuestionPage";
import { DOC_TYPES, getDocType } from "@/lib/doc-types";

export function generateStaticParams() {
  return DOC_TYPES.filter((d) => d.ready).map((d) => ({ docType: d.id }));
}

async function DocPage({ params }: { params: PageProps<"/new/[docType]">["params"] }) {
  const { docType } = await params;
  const doc = getDocType(docType);
  if (!doc?.ready) notFound();
  return <QuestionPage docId={doc.id} />;
}

export default function Page({ params }: PageProps<"/new/[docType]">) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-canvas" />}>
      <DocPage params={params} />
    </Suspense>
  );
}
