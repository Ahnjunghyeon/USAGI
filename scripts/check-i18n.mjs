import { KO, EN, JA, ZH } from "../lib/i18n.ts";

const dictionaries = { KO, EN, JA, ZH };
const baseKeys = Object.keys(KO).sort();
const problems = [];
for (const [name, dictionary] of Object.entries(dictionaries)) {
  const keys = Object.keys(dictionary).sort();
  const missing = baseKeys.filter((key) => !keys.includes(key));
  const extra = keys.filter((key) => !baseKeys.includes(key));
  const blank = keys.filter((key) => typeof dictionary[key] !== "string" || dictionary[key].trim().length === 0);
  if (missing.length) problems.push(`${name} missing: ${missing.join(", ")}`);
  if (extra.length) problems.push(`${name} extra: ${extra.join(", ")}`);
  if (blank.length) problems.push(`${name} blank: ${blank.join(", ")}`);
}
for (const [name, dictionary] of Object.entries(dictionaries)) {
  for (const [key, value] of Object.entries(dictionary)) {
    if (/<br\s*\/?\s*>/i.test(value)) problems.push(`${name}.${key} contains HTML line break`);
    if (/\n/.test(value)) problems.push(`${name}.${key} contains forced line break`);
  }
}
if (problems.length) {
  console.error("[USAGI i18n] failed\n" + problems.map((item) => `- ${item}`).join("\n"));
  process.exit(1);
}
console.log(`[USAGI i18n] ${baseKeys.length} keys × 4 locales synchronized`);
