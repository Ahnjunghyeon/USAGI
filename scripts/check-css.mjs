import fs from "node:fs";

const files = ["app/globals.css", "styles/layout.css", "styles/components.css", "styles/interactions.css", "styles/report.css", "styles/accessibility.css"];
const content = Object.fromEntries(files.map((file) => [file, fs.readFileSync(file, "utf8")]));
const rules = [
  [".shell", "styles/layout.css"],
  [".mobile-frame", "styles/layout.css"],
  [".report-shell", "styles/report.css"],
  [".result-title", "styles/report.css"],
  [".result-actions", "styles/report.css"],
  [".friend-card", "styles/report.css"],
];
const errors = [];
for (const [selector, owner] of rules) {
  for (const [file, source] of Object.entries(content)) {
    const declaration = new RegExp(`${selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*\\{`);
    if (file !== owner && declaration.test(source)) errors.push(`${selector} must be owned by ${owner}, found in ${file}`);
  }
}
if (/\.result-actions\s*\{[^}]*position\s*:\s*fixed/s.test(content["styles/report.css"])) errors.push("result actions must not be fixed");
if (/\.result-title\s*\{[^}]*max-width\s*:\s*15ch/s.test(content["styles/report.css"])) errors.push("result title must not be constrained to 15ch");
if (errors.length) {
  console.error("[USAGI CSS] failed\n" + errors.map((item) => `- ${item}`).join("\n"));
  process.exit(1);
}
console.log("[USAGI CSS] critical selector ownership passed");
