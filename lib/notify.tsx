"use client";

import { toast } from "sonner";

// 사이트 알림. Sonner는 위치·쌓기·스와이프만 맡고, 모양은 DESIGN.md의 작은 어두운 카드로 직접 그린다(headless).
// <Toaster />는 app/layout.tsx에 한 번만 둔다.

type Kind = "success" | "error" | "info" | "loading";
type Action = { label: string; onClick: () => void };
type Options = {
  id?: string | number;
  description?: string;
  action?: Action;
  duration?: number;
  onAutoClose?: () => void;
  onDismiss?: () => void;
};

const DOT: Record<Kind, string> = {
  success: "bg-accent-teal",
  error: "bg-error",
  info: "bg-on-dark-soft",
  loading: "bg-accent-amber animate-pulse",
};

function Card({ kind, title, description, action, onClose }: {
  kind: Kind;
  title: string;
  description?: string;
  action?: Action;
  onClose: () => void;
}) {
  return (
    <div
      role={kind === "error" ? "alert" : "status"}
      className="flex w-[min(380px,calc(100vw-32px))] items-start gap-sm rounded-lg bg-surface-dark px-md py-sm text-on-dark"
    >
      <span className={`mt-[7px] h-2 w-2 shrink-0 rounded-full ${DOT[kind]}`} aria-hidden />
      <div className="min-w-0 flex-1">
        <p className="text-body-sm font-medium">{title}</p>
        {description && <p className="mt-xxs text-caption text-on-dark-soft">{description}</p>}
      </div>
      {action && (
        <button
          type="button"
          onClick={() => {
            action.onClick();
            onClose();
          }}
          className="shrink-0 rounded-md bg-surface-dark-elevated px-sm py-xxs text-body-sm font-medium text-on-dark active:bg-surface-dark-soft"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}

function show(kind: Kind, title: string, opts: Options = {}) {
  return toast.custom((t) => <Card kind={kind} title={title} description={opts.description} action={opts.action} onClose={() => toast.dismiss(t)} />, {
    id: opts.id,
    // 되돌리기 같은 버튼이 있으면 읽고 누를 시간을 넉넉히 준다
    duration: kind === "loading" ? Infinity : (opts.duration ?? (opts.action ? 10000 : 4000)),
    onAutoClose: opts.onAutoClose,
    onDismiss: opts.onDismiss,
  });
}

export const notify = {
  success: (title: string, opts?: Options) => show("success", title, opts),
  error: (title: string, opts?: Options) => show("error", title, { duration: 6000, ...opts }),
  info: (title: string, opts?: Options) => show("info", title, opts),
  loading: (title: string, opts?: Options) => show("loading", title, opts),
  dismiss: (id?: string | number) => toast.dismiss(id),
  // "저장 중… → 저장했어요"처럼 같은 알림 하나가 바뀐다
  async promise<T>(work: Promise<T>, msg: { loading: string; success: (value: T) => string | null; error: string }) {
    const id = show("loading", msg.loading);
    try {
      const value = await work;
      const text = msg.success(value);
      if (text) show("success", text, { id });
      else show("error", msg.error, { id, duration: 6000 });
      return value;
    } catch (err) {
      show("error", msg.error, { id, duration: 6000 });
      throw err;
    }
  },
};
