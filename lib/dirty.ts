// 질문 화면에 저장하지 않은 답이 있는지 기억한다 (다른 화면으로 갈 때 확인 창용)
let dirty = false;

export const LEAVE_MESSAGE = "저장하지 않은 내용이 사라져요. 그래도 이동할까요?";

export function setDirty(value: boolean) {
  dirty = value;
}

export function confirmLeave() {
  return !dirty || window.confirm(LEAVE_MESSAGE);
}
