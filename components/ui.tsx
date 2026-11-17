// DESIGN.md 부품을 Tailwind 클래스로 옮긴 것
// 글자가 올라가는 코랄은 대비 4.5:1을 넘는 primary-active 이상만 쓴다. 한 줄의 컨트롤은 모두 40px(h-10).

export const btnPrimary =
  "inline-flex h-10 items-center justify-center gap-xs rounded-md bg-primary-active px-5 text-button font-medium text-on-primary active:bg-primary-pressed disabled:bg-primary-disabled disabled:text-muted";

export const btnSecondary =
  "inline-flex h-10 items-center justify-center gap-xs rounded-md border border-hairline bg-canvas px-5 text-button font-medium text-ink disabled:text-muted";

export const btnText = "inline-flex items-center text-button font-medium text-ink";

// 글자 링크: 코랄 글씨는 대비가 모자라서 잉크색 + 밑줄로 쓴다
export const textLink = "font-medium text-ink underline decoration-primary-active decoration-2 underline-offset-4";

export const inputBase =
  "w-full rounded-md border border-hairline bg-canvas px-[14px] py-[10px] text-body-md text-ink placeholder:text-muted focus:border-primary focus:outline-none focus:ring-[3px] focus:ring-primary/15";

export function tabClass(active: boolean) {
  return `inline-flex h-10 shrink-0 items-center whitespace-nowrap rounded-md px-[14px] text-body-sm font-medium ${active ? "bg-surface-card text-ink" : "text-muted"}`;
}

export function Badge({ required }: { required?: boolean }) {
  return required ? (
    <span className="rounded-pill bg-primary-tint px-sm py-xxs text-caption font-medium text-primary-ink">필수</span>
  ) : (
    <span className="rounded-pill bg-surface-card px-sm py-xxs text-caption font-medium text-ink">선택</span>
  );
}

export function SensitiveNotice({ children }: { children?: React.ReactNode }) {
  return (
    <p className="rounded-md border border-warning/40 bg-surface-soft px-md py-sm text-body-sm text-body-strong">
      <strong className="mr-xs font-medium text-ink">주의</strong>
      {children ?? "고객 정보·개인정보·비밀번호는 넣지 마세요. 결과물은 나중에 외부 AI에 올라갑니다."}
    </p>
  );
}
