import { describe, expect, it } from "vitest";
import { recentRecords } from "./history";
import type { PromptRecord } from "./types";

const record: PromptRecord = {
  id: "r1",
  docType: "ppt",
  title: "3분기 보고",
  status: "done",
  answers: { title: "3분기 보고" },
  attachmentsMeta: [{ name: "a.png", usage: "표지" }],
  promptMd: "x",
  aiRefined: true,
  createdAt: "2026-10-23T00:00:00Z",
  updatedAt: "2026-10-23T01:00:00Z",
};

describe("recent records for the first screen", () => {
  it("returns the newest records first, at most the requested count", () => {
    const older = { ...record, id: "a", updatedAt: "2026-10-20T00:00:00Z" };
    const newest = { ...record, id: "b", updatedAt: "2026-10-23T05:00:00Z" };
    const middle = { ...record, id: "c", updatedAt: "2026-10-22T00:00:00Z" };
    expect(recentRecords([older, newest, middle], 2).map((r) => r.id)).toEqual(["b", "c"]);
  });
});
