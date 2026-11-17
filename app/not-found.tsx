import Link from "next/link";
import { btnPrimary } from "@/components/ui";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-md bg-canvas px-lg text-center">
      <h1 className="font-display text-display-sm text-ink">찾는 화면이 없어요</h1>
      <p className="text-body-md text-muted">아직 준비 중인 문서 종류이거나 주소가 바뀌었어요.</p>
      <Link href="/" className={btnPrimary}>
        처음으로
      </Link>
    </main>
  );
}
