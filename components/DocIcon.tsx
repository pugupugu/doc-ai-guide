// 문서 종류 아이콘. DESIGN.md 톤: 잉크색 선 + 코랄 포인트 하나, 크림색 타일 위에 놓는다.

const ACCENT = "var(--color-primary)";

const PATHS: Record<string, React.ReactNode> = {
  ppt: (
    <>
      <rect x="3" y="4" width="18" height="12" rx="1.5" />
      <path d="M12 16v3M8.5 20h7" />
      <path d="M8 13v-2M12 13V8M16 13v-4" stroke={ACCENT} />
    </>
  ),
  excel: (
    <>
      <rect x="3.5" y="4" width="17" height="16" rx="1.5" />
      <path d="M3.5 9h17M3.5 14.5h17M9.5 4v16" />
      <rect x="9.5" y="9" width="11" height="5.5" fill={ACCENT} fillOpacity="0.18" stroke={ACCENT} />
    </>
  ),
  word: (
    <>
      <path d="M6 3h8l4 4v14H6z" />
      <path d="M14 3v4h4" />
      <path d="M9 11h6" stroke={ACCENT} />
      <path d="M9 14.5h6M9 18h4" />
    </>
  ),
  email: (
    <>
      <rect x="3" y="5.5" width="18" height="13" rx="1.5" />
      <path d="M3.5 6.5l8.5 6.5 8.5-6.5" stroke={ACCENT} />
    </>
  ),
  hwp: (
    <>
      <path d="M6 3h8l4 4v14H6z" />
      <path d="M14 3v4h4" />
      <circle cx="12" cy="14" r="3" stroke={ACCENT} />
      <path d="M9 9h3" />
    </>
  ),
  pdf: (
    <>
      <path d="M6 3h8l4 4v14H6z" />
      <path d="M14 3v4h4" />
      <rect x="4" y="12" width="12" height="5" rx="1" fill={ACCENT} stroke={ACCENT} />
    </>
  ),
  md: (
    <>
      <path d="M6 3h8l4 4v14H6z" />
      <path d="M14 3v4h4" />
      <path d="M10 11l-1 7M13.5 11l-1 7M8.5 13.2h6M8 16h6" stroke={ACCENT} />
    </>
  ),
  diagram: (
    <>
      <rect x="9" y="3" width="6" height="5" rx="1" stroke={ACCENT} />
      <rect x="3" y="16" width="6" height="5" rx="1" />
      <rect x="15" y="16" width="6" height="5" rx="1" />
      <path d="M12 8v4M6 16v-4h12v4" />
    </>
  ),
  icon: (
    <>
      <rect x="3.5" y="3.5" width="17" height="17" rx="4" />
      <path
        d="M12 7.5l1.3 2.8 3 .4-2.2 2.1.5 3-2.6-1.4-2.6 1.4.5-3-2.2-2.1 3-.4z"
        stroke={ACCENT}
      />
    </>
  ),
  image: (
    <>
      <rect x="3" y="4.5" width="18" height="15" rx="1.5" />
      <path d="M3.5 17l5-5 4 4 3-3 5 5" />
      <circle cx="16" cy="9" r="1.6" stroke={ACCENT} />
    </>
  ),
};

// plain: 상자 없이 아이콘만 (목록 줄에 반복될 때 상자를 빼서 "템플릿 티"를 줄인다)
export function DocIcon({ id, size = "md", plain = false }: { id: string; size?: "sm" | "md"; plain?: boolean }) {
  const box = plain ? "h-5 w-5" : size === "sm" ? "h-8 w-8" : "h-10 w-10";
  const svg = plain ? 20 : size === "sm" ? 18 : 22;
  const tile = plain ? "" : "rounded-md bg-surface-card";
  return (
    <span className={`inline-flex ${box} shrink-0 items-center justify-center ${tile} text-ink`} aria-hidden>
      <svg
        width={svg}
        height={svg}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {PATHS[id]}
      </svg>
    </span>
  );
}
