import { existsSync } from "node:fs";

const forbidden = [
  "components/ReportDemo.tsx",
  "components/UploadMock.tsx",
  "app/report/demo/page.tsx",
  "app/api/preflight/route.ts",
  "app/api/conversation/parse/route.ts",
  "lib/client/image-dataset-manager.ts",
  "lib/client/preflight.ts",
  "lib/conversation/dataset.ts",
  "lib/conversation/types.ts",
];

const found = forbidden.filter(existsSync);
if (found.length) {
  console.error("\n[USAGI QA] 오래된 Demo/Mock 또는 실험용 파이프라인 파일이 남아 있습니다.");
  for (const file of found) console.error(`- ${file}`);
  console.error("기존 폴더에 새 버전을 덮어쓸 때 남은 파일일 수 있습니다. 위 파일을 삭제한 뒤 다시 빌드해 주세요.\n");
  process.exit(1);
}
console.log("[USAGI QA] legacy Demo/Mock check passed");
