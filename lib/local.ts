// 폴더 저장은 내 PC 주소(localhost:3000)에서만 된다. 화면과 서버가 같이 쓴다.
export const LOCAL_HOSTS = ["localhost:3000", "127.0.0.1:3000"];

export function isLocalSite(host: string) {
  return LOCAL_HOSTS.includes(host);
}
