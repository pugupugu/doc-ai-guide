// 비동기로 불러온 값이 지금 주소(key)의 것일 때만 쓴다.
// 뒤로/앞으로 가기로 주소만 바뀌면 이전 기록이 남아 다른 기록을 덮어쓰는 것을 막는다.
export type Loaded<T> = { key: string; value: T } | null;

export function loadedFor<T>(loaded: Loaded<T>, key: string): T | null {
  return loaded && loaded.key === key ? loaded.value : null;
}
