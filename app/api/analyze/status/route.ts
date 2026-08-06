import { NextResponse } from "next/server";
import type { AnalysisResult, GroupAnalysis } from "@/lib/analysis";
import { getCachedAnalysis } from "@/lib/request-manager";
import { isAnalysisActive } from "@/lib/rate-limit";

export const runtime = "nodejs";

function json(body: unknown, status = 200, extraHeaders?: Record<string, string>) {
  return NextResponse.json(body, {
    status,
    headers: { "Cache-Control": "no-store, max-age=0", ...extraHeaders },
  });
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const jobId = url.searchParams.get("jobId") ?? "";
  if (!/^[a-f0-9]{64}$/i.test(jobId)) return json({ status: "invalid" }, 400);

  const result = await getCachedAnalysis<AnalysisResult & { groupAnalysis?: GroupAnalysis }>(jobId);
  if (result) return json({ status: "complete", result });

  const active = await isAnalysisActive(`analysis:${jobId}`);
  if (active) return json({ status: "processing", jobId, retryAfter: 1 }, 202, { "Retry-After": "1" });
  return json({ status: "expired" }, 404);
}
