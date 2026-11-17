// lib/doc-types.ts의 질문 목록을 index.template.html에 끼워 넣어 index.html을 만든다.
// 사용: node --experimental-strip-types scripts/build-index.mjs
import { DOC_TYPES } from "../lib/doc-types.ts";
import fs from "node:fs";

const slim = DOC_TYPES.filter((d) => d.ready).map((d) => ({
  id: d.id,
  name: d.name,
  description: d.description,
  output: d.output ?? d.name,
  groups: d.groups.map((g) => ({
    id: g.id,
    title: g.title,
    attachments: g.kind === "attachments",
    questions: g.questions.map((q) => ({
      id: q.id,
      label: q.label,
      promptLabel: q.promptLabel ?? q.label,
      type: q.type,
      section: q.section,
      options: q.options ?? [],
      required: !!q.required,
      placeholder: q.placeholder ?? "",
      help: q.help ?? "",
    })),
  })),
}));

const tpl = fs.readFileSync(new URL("../index.template.html", import.meta.url), "utf8");
// "<" 를 이스케이프해서 데이터 안의 문자열이 </script> 를 만들지 못하게 한다
const json = JSON.stringify(slim).replace(/</g, "\\u003c");
fs.writeFileSync(new URL("../index.html", import.meta.url), tpl.replace("/*__DOC_TYPES__*/[]", () => json));
console.log("index.html 생성:", slim.map((d) => d.id).join(", "));
