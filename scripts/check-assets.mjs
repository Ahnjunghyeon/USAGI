import fs from "node:fs";
import path from "node:path";

const errors = [];
for (const forbidden of ["public/temp", "public/ai-friends/temp", "public/ai-friends"]) {
  if (fs.existsSync(forbidden)) errors.push(`legacy asset directory remains: ${forbidden}`);
}
let total = 0;
function walk(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const target = path.join(directory, entry.name);
    if (entry.isDirectory()) walk(target);
    else {
      const size = fs.statSync(target).size;
      total += size;
      if ((target.includes("ai-friends-ui") || target.includes(`${path.sep}ui${path.sep}`)) && size > 120_000) errors.push(`UI asset too large: ${target} (${size})`);
    }
  }
}
walk("public");
if (total > 2_000_000) errors.push(`public assets exceed 2MB: ${total}`);
if (errors.length) {
  console.error("[USAGI assets] failed\n" + errors.map((item) => `- ${item}`).join("\n"));
  process.exit(1);
}
console.log(`[USAGI assets] ${(total / 1024).toFixed(1)}KB public bundle passed`);
