import { mkdir, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse, type NextRequest } from "next/server";
import { isLocalSite } from "@/lib/local";

// 내 PC에서 실행할 때만 결과물을 프로젝트 폴더 안 "결과물/"에 저장한다.
// 배포 서버(Vercel)에서는 저장하지 않는다.

const OUTPUT_DIR = path.join(process.cwd(), "결과물");
const MAX_TOTAL_BYTES = 100 * 1024 * 1024;

// 폴더·파일 이름에서 위험한 글자와 경로 이동(../)을 없앤다
function safeName(name: string) {
  const base = path.basename(name.replace(/\\/g, "/"));
  const cleaned = base.replace(/[<>:"/\\|?*\u0000-\u001f]/g, "").replace(/^\.+/, "").trim();
  return cleaned.slice(0, 120) || "파일";
}

async function exists(p: string) {
  try {
    await stat(p);
    return true;
  } catch {
    return false;
  }
}

async function freeFolder(name: string) {
  let candidate = path.join(OUTPUT_DIR, name);
  for (let i = 2; await exists(candidate); i++) candidate = path.join(OUTPUT_DIR, `${name} (${i})`);
  return candidate;
}

export async function POST(request: NextRequest) {
  const host = request.headers.get("host") ?? "";
  if (process.env.VERCEL || !isLocalSite(host)) {
    return NextResponse.json({ error: "폴더 저장은 내 PC에서 실행할 때만 쓸 수 있어요." }, { status: 403 });
  }

  const form = await request.formData().catch(() => null);
  const folder = safeName(String(form?.get("folder") ?? ""));
  const promptMd = form?.get("promptMd");
  const promptFile = safeName(String(form?.get("promptFile") ?? "초안생성프롬프트.md"));
  const files = (form?.getAll("files") ?? []).filter((f): f is File => f instanceof File);

  if (typeof promptMd !== "string" || !promptMd.trim()) {
    return NextResponse.json({ error: "저장할 내용이 없어요." }, { status: 400 });
  }
  if (files.reduce((s, f) => s + f.size, 0) > MAX_TOTAL_BYTES) {
    return NextResponse.json({ error: "첨부 파일이 너무 커요 (전체 100MB까지)." }, { status: 413 });
  }

  try {
    const target = await freeFolder(folder);
    await mkdir(target, { recursive: true });
    await writeFile(path.join(target, promptFile), promptMd, "utf8");

    if (files.length > 0) {
      const attachDir = path.join(target, "첨부자료");
      await mkdir(attachDir, { recursive: true });
      for (const f of files) {
        await writeFile(path.join(attachDir, safeName(f.name)), Buffer.from(await f.arrayBuffer()));
      }
    }

    return NextResponse.json({
      path: target,
      relative: path.relative(process.cwd(), target),
    });
  } catch {
    return NextResponse.json({ error: "폴더에 저장하지 못했어요. 다시 시도해 주세요." }, { status: 500 });
  }
}
