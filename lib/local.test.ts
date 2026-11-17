import { describe, expect, it } from "vitest";
import { isLocalSite } from "./local";

describe("isLocalSite", () => {
  it("treats the local dev address as local", () => {
    expect(isLocalSite("localhost:3000")).toBe(true);
    expect(isLocalSite("127.0.0.1:3000")).toBe(true);
  });

  it("treats the deployed site as not local", () => {
    expect(isLocalSite("doc-prompt-kappa.vercel.app")).toBe(false);
    expect(isLocalSite("localhost:3001")).toBe(false);
  });
});
