"use client";

import type { AnswerValue, Question } from "@/lib/types";
import { Badge, inputBase } from "./ui";

type Props = {
  question: Question;
  value: AnswerValue | undefined;
  error?: boolean;
  onChange: (value: AnswerValue) => void;
};

export function QuestionField({ question: q, value, error, onChange }: Props) {
  const id = `q-${q.id}`;
  const helpId = `${id}-help`;
  const errClass = error ? "border-error" : "";
  const text = typeof value === "string" ? value : "";
  const list = Array.isArray(value) ? value : [];

  let control: React.ReactNode;
  if (q.type === "textarea") {
    control = (
      <textarea
        id={id}
        rows={3}
        value={text}
        placeholder={q.placeholder}
        onChange={(e) => onChange(e.target.value)}
        className={`${inputBase} min-h-24 resize-y ${errClass}`}
        aria-invalid={error}
        aria-describedby={q.help ? helpId : undefined}
      />
    );
  } else if (q.type === "select") {
    control = (
      <select
        id={id}
        value={text}
        onChange={(e) => onChange(e.target.value)}
        className={`${inputBase} h-10 py-0 ${text ? "" : "text-muted"} ${errClass}`}
        aria-invalid={error}
      >
        <option value="">고르기</option>
        {q.options?.map((o) => (
          <option key={o} value={o} className="text-ink">
            {o}
          </option>
        ))}
      </select>
    );
  } else if (q.type === "multiselect") {
    control = (
      <div id={id} role="group" aria-label={q.label} className="flex flex-wrap gap-xs">
        {q.options?.map((o) => {
          const on = list.includes(o);
          return (
            <button
              key={o}
              type="button"
              aria-pressed={on}
              onClick={() => onChange(on ? list.filter((x) => x !== o) : [...list, o])}
              className={`inline-flex h-10 items-center gap-xs rounded-md border px-[14px] text-body-sm font-medium ${
                on ? "border-ink bg-surface-card text-ink" : "border-hairline bg-canvas text-muted"
              }`}
            >
              {on && (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="M5 12.5l4.5 4.5L19 7.5" />
                </svg>
              )}
              {o}
            </button>
          );
        })}
      </div>
    );
  } else {
    control = (
      <input
        id={id}
        type={q.type === "number" ? "number" : "text"}
        inputMode={q.type === "number" ? "numeric" : undefined}
        min={q.type === "number" ? 0 : undefined}
        value={text}
        placeholder={q.placeholder}
        onChange={(e) => onChange(e.target.value)}
        className={`${inputBase} h-10 ${errClass}`}
        aria-invalid={error}
        aria-describedby={q.help ? helpId : undefined}
      />
    );
  }

  return (
    <div className="flex flex-col gap-xs scroll-mt-32" id={`field-${q.id}`}>
      <div className="flex items-center gap-xs">
        <label htmlFor={id} className="text-title-sm font-medium text-ink">
          {q.label}
        </label>
        <Badge required={q.required} />
      </div>
      {control}
      {q.help && (
        <p id={helpId} className="text-caption text-muted">
          {q.help}
        </p>
      )}
      {error && <p className="text-caption text-error">꼭 답해 주세요.</p>}
    </div>
  );
}
