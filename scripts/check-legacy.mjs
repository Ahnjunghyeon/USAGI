import { existsSync } from "node:fs";

const forbidden = [
  "components/ReportDemo.tsx",
  "components/UploadMock.tsx",
  "app/report/demo/page.tsx",
];

const found = forbidden.filter(existsSync);
if (found.length) {
  console.error("\n[USAGI QA] 오래된 Demo/Mock 파일이 남아 있습니다.");
  for (const file of found) console.error(`- ${file}`);
  console.error("기존 폴더에 새 버전을 덮어쓸 때 남은 파일일 수 있습니다. 위 파일을 삭제한 뒤 다시 빌드해 주세요.\n");
  process.exit(1);
}
console.log("[USAGI QA] legacy Demo/Mock check passed");
