"use client";

import { Toaster } from "sonner";

// 사이트 전체에 한 번만 둔다. 휴대폰에서는 아래 고정 버튼 줄(약 72px) 위로 띄운다.
export function AppToaster() {
  return (
    <Toaster
      position="bottom-center"
      theme="light"
      offset={24}
      mobileOffset={{ bottom: "96px", left: "16px", right: "16px" }}
      toastOptions={{ unstyled: true }}
    />
  );
}
