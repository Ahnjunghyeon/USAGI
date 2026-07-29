const OPENAI_URL = "https://api.openai.com/v1/responses";

export type OpenAIUsage = { inputTokens: number; outputTokens: number; totalTokens: number };
export type OpenAIResult = { text: string; model: string; usage: OpenAIUsage };
export type JsonSchemaFormat = { name: string; schema: Record<string, unknown>; strict?: boolean };

export class OpenAIError extends Error {
  status: number;
  code?: string;
  type?: string;

  constructor(message: string, status: number, code?: string, type?: string) {
    super(message);
    this.name = "OpenAIError";
    this.status = status;
    this.code = code;
    this.type = type;
  }
}

export class AnalysisCancelledError extends Error {
  constructor() {
    super("ANALYSIS_CANCELLED");
    this.name = "AnalysisCancelledError";
  }
}

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


function normalizeReasoningEffort(model: string, requested?: "none" | "minimal" | "low" | "medium" | "high" | "xhigh") {
  if (!requested) return undefined;
  // GPT-5 mini does not accept `none`; its lowest supported value is `minimal`.
  if (model === "gpt-5-mini" || model.startsWith("gpt-5-mini-")) {
    return requested === "none" ? "minimal" : requested === "xhigh" ? "high" : requested;
  }
  // GPT-5.4 mini/nano and newer 5.4 family accept `none`; `minimal` is not part of that family.
  if (model.startsWith("gpt-5.4")) {
    return requested === "minimal" ? "none" : requested;
  }
  return requested;
}

export async function callOpenAI(
  input: unknown,
  options?: {
    instructions?: string;
    model?: string;
    maxOutputTokens?: number;
    jsonSchema?: JsonSchemaFormat;
    safetyIdentifier?: string;
    signal?: AbortSignal;
    reasoningEffort?: "none" | "minimal" | "low" | "medium" | "high" | "xhigh";
  },
): Promise<OpenAIResult> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new OpenAIError("OPENAI_API_KEY_MISSING", 503, "api_key_missing");
  if (options?.signal?.aborted) throw new AnalysisCancelledError();

  const model = options?.model || process.env.OPENAI_ANALYSIS_MODEL || "gpt-5.4-nano";
  const body: Record<string, unknown> = {
    model,
    instructions: options?.instructions,
    input,
    max_output_tokens: options?.maxOutputTokens ?? 700,
  };
  const reasoningEffort = normalizeReasoningEffort(model, options?.reasoningEffort);
  if (reasoningEffort) body.reasoning = { effort: reasoningEffort };
  if (options?.safetyIdentifier) body.safety_identifier = options.safetyIdentifier;
  if (options?.jsonSchema) {
    body.text = {
      format: {
        type: "json_schema",
        name: options.jsonSchema.name,
        schema: options.jsonSchema.schema,
        strict: options.jsonSchema.strict ?? true,
      },
    };
  }

  let response: Response;
  try {
    response = await fetch(OPENAI_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify(body),
      cache: "no-store",
      signal: options?.signal,
    });
  } catch (error) {
    if (options?.signal?.aborted || (error instanceof DOMException && error.name === "AbortError")) {
      throw new AnalysisCancelledError();
    }
    throw error;
  }

  const responseBody = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = (responseBody as { error?: { message?: string; code?: string; type?: string } }).error;
    throw new OpenAIError(error?.message || `OpenAI API 오류 (${response.status})`, response.status, error?.code, error?.type);
  }

  if (options?.signal?.aborted) throw new AnalysisCancelledError();

  const responseMeta = responseBody as {
    status?: string;
    incomplete_details?: { reason?: string };
  };
  if (responseMeta.status === "incomplete") {
    const reason = responseMeta.incomplete_details?.reason || "unknown";
    throw new OpenAIError(
      reason === "max_output_tokens"
        ? "AI JSON 응답이 출력 한도에서 잘렸습니다."
        : "AI 응답이 완료되기 전에 종료되었습니다.",
      502,
      reason === "max_output_tokens" ? "output_truncated" : "incomplete_response",
      "incomplete_response",
    );
  }

  const text = getOutputText(responseBody);
  if (!text) throw new OpenAIError("AI 응답에서 텍스트를 찾지 못했습니다.", 502, "empty_response");
  return { text, model, usage: getUsage(responseBody) };
}

export function parseJsonText<T>(text: string): T {
  const cleaned = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
  try {
    return JSON.parse(cleaned) as T;
  } catch (error) {
    const preview = cleaned.slice(Math.max(0, cleaned.length - 160));
    console.error("[usagi/json] invalid structured output", { length: cleaned.length, tail: preview });
    throw new OpenAIError(
      error instanceof SyntaxError ? `AI JSON 응답 형식 오류: ${error.message}` : "AI JSON 응답을 해석하지 못했습니다.",
      502,
      "invalid_json_output",
      "structured_output_error",
    );
  }
}
