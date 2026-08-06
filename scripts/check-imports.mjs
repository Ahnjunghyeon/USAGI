import fs from "node:fs";
import path from "node:path";

const missing = [];
function walk(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (["node_modules", ".next", ".git"].includes(entry.name)) continue;
    const target = path.join(directory, entry.name);
    if (entry.isDirectory()) walk(target);
    else if (/\.tsx?$/.test(entry.name)) {
      const source = fs.readFileSync(target, "utf8");
      for (const match of source.matchAll(/from\s+["']@\/(.+?)["']/g)) {
        const base = path.resolve(match[1]);
        const candidates = [base, `${base}.ts`, `${base}.tsx`, path.join(base, "index.ts"), path.join(base, "index.tsx")];
        if (!candidates.some(fs.existsSync)) missing.push(`${target} -> @/${match[1]}`);
      }
    }
  }
}
walk(process.cwd());
if (missing.length) {
  console.error("[USAGI imports] missing local imports\n" + missing.join("\n"));
  process.exit(1);
}
console.log("[USAGI imports] local alias imports resolved");
