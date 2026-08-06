import fs from "node:fs";
const required = [
  "next.config.ts",
  "app/api/analyze/route.ts",
  "app/api/analyze/status/route.ts",
  "app/policy/page.tsx",
  "lib/server/analyze-contract.ts",
  "lib/server/analysis-copy.ts",
  "lib/client/image-draft-store.ts",
  "USAGI_QA_REFACTOR.md",
  "components/report/AnalysisFeedback.tsx",
  "lib/client/feedback.ts",
];
const missing = required.filter((file) => !fs.existsSync(file));
const env = fs.readFileSync(".env.example", "utf8");
const policySource = fs.readFileSync("app/policy/page.tsx", "utf8");
const errors = [...missing.map((file) => `missing: ${file}`)];
if (!env.includes("OPENAI_API_KEY")) errors.push(".env.example must document OPENAI_API_KEY");
if (/sk-[A-Za-z0-9]{16,}/.test(env)) errors.push(".env.example appears to contain a real secret");
for (const locale of ["ko", "en", "ja", "zh"]) {
  if (!new RegExp(`\\b${locale}\\s*:`).test(policySource)) errors.push(`policy page missing locale: ${locale}`);
}
if (errors.length) {
  console.error("[USAGI release] failed\n" + errors.map((item) => `- ${item}`).join("\n"));
  process.exit(1);
}
console.log("[USAGI release] release foundation files passed");
