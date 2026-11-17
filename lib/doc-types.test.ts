import { describe, expect, it } from "vitest";
import { allQuestions, DOC_TYPES } from "./doc-types";
import { buildCore } from "./prompt";
import type { Answers } from "./types";

describe("document types", () => {
  it("offers all 10 document types", () => {
    expect(DOC_TYPES.map((d) => d.id)).toEqual([
      "ppt", "excel", "word", "email", "hwp", "pdf", "md", "diagram", "icon", "image",
    ]);
  });

  for (const doc of DOC_TYPES) {
    describe(doc.name, () => {
      it("is ready with an output format and the shared groups", () => {
        expect(doc.ready).toBe(true);
        expect(doc.output).toBeTruthy();
        expect(doc.groups.map((g) => g.id)).toEqual(["basic", "content", "design", "attachments", "extra"]);
      });

      it("has unique question ids and options for every choice question", () => {
        const qs = allQuestions(doc);
        expect(new Set(qs.map((q) => q.id)).size).toBe(qs.length);
        for (const q of qs.filter((q) => q.type === "select" || q.type === "multiselect")) {
          expect(q.options?.length ?? 0).toBeGreaterThan(1);
        }
      });

      it("asks at least one required content question", () => {
        const content = doc.groups.find((g) => g.id === "content")!;
        expect(content.questions.some((q) => q.required)).toBe(true);
      });

      it("builds a prompt from the required answers", () => {
        const answers: Answers = {};
        for (const q of allQuestions(doc).filter((q) => q.required)) {
          answers[q.id] = q.type === "multiselect" ? [q.options![0]] : q.type === "select" ? q.options![0] : "값";
        }
        const md = buildCore(doc, answers);
        expect(md).toContain(`너는 ${doc.name} 작성 전문가야`);
        expect(md).toContain(doc.output!);
      });
    });
  }
});
