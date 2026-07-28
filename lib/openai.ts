const OPENAI_URL = "https://api.openai.com/v1/responses";

export type OpenAIUsage = { inputTokens: number; outputTokens: number; totalTokens: number };
export type OpenAIResult = { text: string; model: string; usage: OpenAIUsage };
export type JsonSchemaFormat = { name: string; schema: Record<string, unknown>; strict?: boolean };

function getOutputText(payload: unknown) {
  const data = payload as { output_text?: string; output?: Array<{ content?: Array<{ text?: string }> }> };
  if (typeof data.output_text === "string" && data.output_text.trim()) return data.output_text;
  return (data.output ?? []).flatMap((x) => x.content ?? []).map((x) => x.text ?? "").join("\n").trim();
}
function getUsage(payload: unknown): OpenAIUsage {
  const usage = (payload as { usage?: { input_tokens?: number; output_tokens?: number; total_tokens?: number } }).usage;
  const inputTokens = usage?.input_tokens ?? 0;
  const outputTokens = usage?.output_tokens ?? 0;
  return { inputTokens, outputTokens, totalTokens: usage?.total_tokens ?? inputTokens + outputTokens };
}

export async function callOpenAI(
  input: unknown,
  options?: { instructions?: string; model?: string; maxOutputTokens?: number; jsonSchema?: JsonSchemaFormat },
): Promise<OpenAIResult> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY_MISSING");
  const model = options?.model || process.env.OPENAI_ANALYSIS_MODEL || "gpt-5.4-mini";
  const body: Record<string, unknown> = { model, instructions: options?.instructions, input, max_output_tokens: options?.maxOutputTokens ?? 1200 };
  if (options?.jsonSchema) {
    body.text = { format: { type: "json_schema", name: options.jsonSchema.name, schema: options.jsonSchema.schema, strict: options.jsonSchema.strict ?? true } };
  }
  const response = await fetch(OPENAI_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify(body),
    cache: "no-store",
  });
  const responseBody = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = (responseBody as { error?: { message?: string } }).error?.message || `OpenAI API 오류 (${response.status})`;
    throw new Error(message);
  }
  const text = getOutputText(responseBody);
  if (!text) throw new Error("AI 응답에서 텍스트를 찾지 못했습니다.");
  return { text, model, usage: getUsage(responseBody) };
}

export function parseJsonText<T>(text: string): T {
  const cleaned = text.replace(/^```(?:json)?/i, "").replace(/```$/i, "").trim();
  return JSON.parse(cleaned) as T;
}
