import type { NextConfig } from "next";

// GitHub Pages 배포용: GITHUB_PAGES=true 일 때만 정적 파일로 내보낸다. (BASE_PATH = /저장소이름)
const forPages = process.env.GITHUB_PAGES === "true";

const nextConfig: NextConfig = {
  ...(forPages
    ? { output: "export" as const, basePath: process.env.BASE_PATH ?? "", images: { unoptimized: true }, trailingSlash: true }
    : {}),
  /* config options here */
  // 정적 내보내기(Pages)에서는 부분 사전 렌더링을 쓸 수 없다
  ...(forPages ? {} : { cacheComponents: true, partialPrefetching: true }),
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
