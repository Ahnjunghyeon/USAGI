import fs from "node:fs";

const read = (file) => fs.readFileSync(file, "utf8");
const all = ["app", "components", "lib"].flatMap((root) => {
  const files = [];
  const walk = (dir) => { for (const entry of fs.readdirSync(dir, { withFileTypes: true })) { const target = `${dir}/${entry.name}`; if (entry.isDirectory()) walk(target); else if (/\.(tsx?|jsx?)$/.test(entry.name)) files.push(target); } };
  walk(root); return files;
});
const source = all.map((file) => read(file)).join("\n");
const errors = [];
if (/window\.alert\s*\(|\balert\s*\(/.test(source)) errors.push("window.alert remains; use Toast/live region");
const form = read("components/ui/FormControls.tsx");
if (!form.includes("htmlFor={id}") || !form.includes("aria-invalid")) errors.push("form controls are not explicitly associated and validated");
const sheet = read("components/ui/BottomSheet.tsx");
if (!sheet.includes("FOCUSABLE") || !sheet.includes("previousFocus") || !sheet.includes('event.key !== "Tab"')) errors.push("bottom sheet focus trap/restore missing");
const progress = read("components/ui/ProgressHeader.tsx");
if (!progress.includes('role="progressbar"') || !progress.includes("aria-valuenow")) errors.push("progress semantics missing");
const input = read("components/ConversationInput.tsx");
if (!input.includes('role="tablist"') || !input.includes("aria-selected")) errors.push("input method tabs semantics missing");
if (errors.length) {
  console.error("[USAGI a11y] failed\n" + errors.map((item) => `- ${item}`).join("\n"));
  process.exit(1);
}
console.log("[USAGI a11y] static accessibility contracts passed");
