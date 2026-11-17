import { TopNav } from "./TopNav";

// 로그인 없이 누구나 쓰는 공통 틀 (상단 메뉴 + 본문)
export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-canvas">
      <TopNav />
      {children}
    </div>
  );
}
