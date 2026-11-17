import { describe, expect, it } from "vitest";
import { loadedFor } from "./loaded";

describe("loadedFor", () => {
  it("returns the value loaded for the current address", () => {
    expect(loadedFor({ key: "record=A", value: "A의 답변" }, "record=A")).toBe("A의 답변");
  });

  it("ignores a value loaded for a previous address", () => {
    expect(loadedFor({ key: "record=A", value: "A의 답변" }, "record=B")).toBeNull();
  });

  it("returns null before anything is loaded", () => {
    expect(loadedFor(null, "record=A")).toBeNull();
  });
});
