import { createHash } from "node:crypto";

const ANALYSIS_TTL_SECONDS = Number(process.env.USAGI_ANALYSIS_CACHE_TTL_SECONDS || 600);
const DATASET_TTL_SECONDS = Number(process.env.USAGI_DATASET_CACHE_TTL_SECONDS || 1800);
const memoryCache = new Map<string, { expiresAt: number; result: unknown }>();

function hasUpstash() {
  return Boolean(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN);
}

async function upstash(command: Array<string | number>) {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  const response = await fetch(url, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify(command),
    cache: "no-store",
  });
  if (!response.ok) throw new Error(`REQUEST_CACHE_${response.status}`);
  return response.json() as Promise<{ result?: unknown }>;
}

function readMemory<T>(key: string): T | null {
  const cached = memoryCache.get(key);
  if (!cached) return null;
  if (cached.expiresAt <= Date.now()) {
    memoryCache.delete(key);
    return null;
  }
  return cached.result as T;
}

function writeMemory(key: string, result: unknown, ttlSeconds: number) {
  memoryCache.set(key, { expiresAt: Date.now() + ttlSeconds * 1000, result });
}

export function buildAnalysisFingerprint(clientKey: string, payload: unknown) {
  return createHash("sha256").update(clientKey).update("\nanalysis\n").update(JSON.stringify(payload)).digest("hex");
}

export function buildImageFingerprint(clientKey: string, images: string[]) {
  return createHash("sha256").update(clientKey).update("\nimage-dataset\n").update(JSON.stringify(images)).digest("hex");
}

export async function getCachedAnalysis<T>(fingerprint: string): Promise<T | null> {
  const key = `result:${fingerprint}`;
  if (hasUpstash()) {
    try {
      const response = await upstash(["GET", `usagi:${key}`]);
      if (typeof response?.result === "string") return JSON.parse(response.result) as T;
    } catch (error) { console.error("[usagi/analysis-cache] read failed", error); }
  }
  return readMemory<T>(key);
}

export async function setCachedAnalysis(fingerprint: string, result: unknown) {
  const key = `result:${fingerprint}`;
  writeMemory(key, result, ANALYSIS_TTL_SECONDS);
  if (!hasUpstash()) return;
  try { await upstash(["SET", `usagi:${key}`, JSON.stringify(result), "EX", ANALYSIS_TTL_SECONDS]); }
  catch (error) { console.error("[usagi/analysis-cache] write failed", error); }
}

export async function waitForCachedAnalysis<T>(fingerprint: string, waitMs = 4500): Promise<T | null> {
  const deadline = Date.now() + waitMs;
  while (Date.now() < deadline) {
    const result = await getCachedAnalysis<T>(fingerprint);
    if (result) return result;
    await new Promise((resolve) => setTimeout(resolve, 350));
  }
  return null;
}

export async function getCachedDataset<T>(fingerprint: string): Promise<T | null> {
  const key = `dataset:${fingerprint}`;
  if (hasUpstash()) {
    try {
      const response = await upstash(["GET", `usagi:${key}`]);
      if (typeof response?.result === "string") return JSON.parse(response.result) as T;
    } catch (error) { console.error("[usagi/dataset-cache] read failed", error); }
  }
  return readMemory<T>(key);
}

export async function setCachedDataset(fingerprint: string, result: unknown) {
  const key = `dataset:${fingerprint}`;
  writeMemory(key, result, DATASET_TTL_SECONDS);
  if (!hasUpstash()) return;
  try { await upstash(["SET", `usagi:${key}`, JSON.stringify(result), "EX", DATASET_TTL_SECONDS]); }
  catch (error) { console.error("[usagi/dataset-cache] write failed", error); }
}

export async function waitForCachedDataset<T>(fingerprint: string, waitMs = 6500): Promise<T | null> {
  const deadline = Date.now() + waitMs;
  while (Date.now() < deadline) {
    const result = await getCachedDataset<T>(fingerprint);
    if (result) return result;
    await new Promise((resolve) => setTimeout(resolve, 300));
  }
  return null;
}
