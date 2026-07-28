import { createHmac } from "node:crypto";

export function buildSafetyIdentifier(clientKey: string) {
  const salt = process.env.USAGI_SAFETY_SALT || "usagi-local-development";
  return createHmac("sha256", salt).update(clientKey).digest("hex").slice(0, 64);
}
