import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { execSync } from "node:child_process";

const require = createRequire(import.meta.url);
let ts;
try {
  ts = require("typescript");
} catch {
  const globalRoot = execSync("npm root -g", { encoding: "utf8" }).trim();
  ts = require(path.join(globalRoot, "typescript"));
}
const errors = [];
function walk(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (["node_modules", ".next", ".git"].includes(entry.name)) continue;
    const target = path.join(directory, entry.name);
    if (entry.isDirectory()) walk(target);
    else if (/\.tsx?$/.test(entry.name) && !entry.name.endsWith(".d.ts")) {
      try {
        const result = ts.transpileModule(fs.readFileSync(target, "utf8"), {
          fileName: target,
          reportDiagnostics: true,
          compilerOptions: { jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext },
        });
        for (const diagnostic of result.diagnostics ?? []) errors.push(`${target}: ${ts.flattenDiagnosticMessageText(diagnostic.messageText, " ")}`);
      } catch (error) {
        errors.push(`${target}: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
  }
}
walk(process.cwd());
if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}
console.log("[USAGI syntax] TypeScript/TSX syntax passed");
