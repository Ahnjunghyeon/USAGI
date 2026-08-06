import fs from "node:fs";
const source = fs.readFileSync(new URL("../lib/i18n.ts", import.meta.url), "utf8");
const blocks = Object.fromEntries(["KO","EN","JA","ZH"].map((name) => {
  const start = source.indexOf(`const ${name}`);
  const next = ["KO","EN","JA","ZH"].map((n)=>source.indexOf(`const ${n}`, start+1)).filter((v)=>v>start);
  const end = next.length ? Math.min(...next) : source.indexOf("const DICTS", start);
  return [name, source.slice(start, end)];
}));
const keys = (text) => new Set([...text.matchAll(/(?:^|[,{]\s*)([A-Za-z][A-Za-z0-9]*)\s*:/gm)].map((m)=>m[1]).filter((k)=>!['value','label','short'].includes(k)));
const ko = keys(blocks.KO);
const en = keys(blocks.EN);
const missing = [...ko].filter((key)=>!en.has(key));
if (missing.length) { console.error(`[USAGI i18n] EN missing keys: ${missing.join(', ')}`); process.exit(1); }
for (const key of ['step1Desc','parseOk']) { if (/제거 예정|as any/.test(blocks.KO)) { console.error('[USAGI i18n] temporary copy/type remains'); process.exit(1); } }
console.log(`[USAGI i18n] ${ko.size} base keys verified; EN synchronized; JA/ZH explicit UX overrides enabled`);
