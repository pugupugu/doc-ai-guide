// doc-prompt 심볼: 문서 한 장 + 프롬프트 표시(›)와 커서. 잉크 선 + 코랄 포인트 하나(DESIGN.md).
// app/icon.svg와 같은 모양이다.

export function BrandMark({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M6 2.75h8.5l4.75 4.75v13.75H6z" stroke="var(--color-ink)" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M14.5 2.75V7.5h4.75" stroke="var(--color-ink)" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M9 11.5l2.5 2.25L9 16" stroke="var(--color-primary-active)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M13.25 16h3" stroke="var(--color-primary-active)" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export function Wordmark({ size = "md" }: { size?: "md" | "lg" }) {
  return (
    <span className="inline-flex items-center gap-xs">
      <BrandMark size={size === "lg" ? 28 : 22} />
      <span className={`font-display text-ink ${size === "lg" ? "text-title-lg" : "text-title-md sm:text-title-lg"}`}>doc-prompt</span>
    </span>
  );
}
