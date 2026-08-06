import { OpenAIError } from "@/lib/openai";
import type { Locale } from "@/lib/i18n";

export type ServerErrorKey =
  | "invalid_request"
  | "request_too_large"
  | "invalid_context"
  | "invalid_images"
  | "text_too_long"
  | "invalid_text"
  | "choose_me"
  | "processing"
  | "guard_unavailable"
  | "rate_limit"
  | "daily_budget"
  | "analysis_failed"
  | "service_unavailable"
  | "service_config"
  | "service_quota"
  | "service_busy"
  | "model_unavailable"
  | "incomplete_output"
  | "looks_group"
  | "direct_unclear"
  | "group_unclear"
  | "me_unclear"
  | "side_unclear";

const COPY: Record<Locale, Record<ServerErrorKey, string>> = {
  ko: {
    invalid_request: "요청 내용을 읽지 못했습니다. 입력을 확인한 뒤 다시 시도해 주세요.",
    request_too_large: "업로드 용량이 너무 큽니다. 캡처 수를 줄여주세요.",
    invalid_context: "분석 설정값이 올바르지 않습니다.",
    invalid_images: "대화 캡처가 없거나 이미지 용량이 너무 큽니다. 5장 이하로 다시 올려주세요.",
    text_too_long: "붙여넣은 대화가 너무 깁니다. 필요한 구간만 나눠주세요.",
    invalid_text: "대화 형식을 읽지 못했습니다. 카카오톡 복사 형식이나 ‘이름: 메시지’ 형식으로 붙여넣어 주세요.",
    choose_me: "텍스트 대화에서 본인을 선택해 주세요.",
    processing: "같은 대화를 이미 분석하고 있어요.",
    guard_unavailable: "안전한 분석 연결을 확인하고 있어요.",
    rate_limit: "분석 요청이 많이 이어졌어요. 잠시 후 다시 시도해 주세요.",
    daily_budget: "오늘 준비된 분석 사용량에 도달했습니다.",
    analysis_failed: "분석을 완료하지 못했습니다. 잠시 후 다시 시도해 주세요.",
    service_unavailable: "현재 분석 서비스를 이용할 수 없습니다. 잠시 후 다시 시도해 주세요.",
    service_config: "현재 분석 서비스 설정을 확인하고 있습니다. 잠시 후 다시 시도해 주세요.",
    service_quota: "현재 분석 서비스 이용량이 한도에 도달했습니다. 잠시 후 다시 시도해 주세요.",
    service_busy: "분석 요청이 잠시 몰리고 있습니다. 잠시 후 다시 시도해 주세요.",
    model_unavailable: "현재 선택한 AI 모델을 사용할 수 없습니다. 잠시 후 다시 시도해 주세요.",
    incomplete_output: "AI가 마지막 정리를 완성하지 못했습니다. 입력 내용은 유지되니 다시 한 번 분석해 주세요.",
    looks_group: "여러 사람이 참여한 대화로 보입니다. ‘단체톡’ 모드로 바꾸면 참가자별 흐름을 더 정확하게 볼 수 있어요.",
    direct_unclear: "두 사람의 대화를 충분히 구분하지 못했습니다. 양쪽 말풍선이 잘 보이는 캡처를 추가해 주세요.",
    group_unclear: "단체 대화 참가자를 충분히 구분하지 못했습니다. 3명 이상과 참가자 이름이 보이는 캡처를 추가해 주세요.",
    me_unclear: "사용자가 보낸 메시지를 구분하지 못했습니다. 내 말풍선이 함께 보이는 캡처를 올려주세요.",
    side_unclear: "내 메시지 방향을 자동으로 판단하지 못했습니다. 왼쪽 또는 오른쪽 말풍선을 직접 선택해 주세요.",
  },
  en: {
    invalid_request: "The request could not be read. Check the input and try again.",
    request_too_large: "The upload is too large. Reduce the number of screenshots.",
    invalid_context: "The analysis settings are invalid.", invalid_images: "No valid screenshots were found. Upload up to 5 images.",
    text_too_long: "The pasted chat is too long. Analyze a shorter section.", invalid_text: "I could not read the chat format. Paste a KakaoTalk copy or use ‘Name: message’ format.", choose_me: "Choose which speaker is you.",
    processing: "The same chat is already being analyzed.", guard_unavailable: "The secure analysis connection is being checked.", rate_limit: "Many analysis requests arrived at once. Please try again shortly.", daily_budget: "Today's prepared analysis capacity has been reached.", analysis_failed: "The analysis could not be completed. Please try again shortly.",
    service_unavailable: "The analysis service is temporarily unavailable. Please try again shortly.", service_config: "The analysis service configuration is being checked. Please try again shortly.", service_quota: "The analysis service has reached its current usage limit. Please try again later.", service_busy: "Analysis requests are temporarily busy. Please try again shortly.", model_unavailable: "The selected AI model is temporarily unavailable.", incomplete_output: "The AI could not finish the final summary. Your input is preserved, so please try again.",
    looks_group: "This looks like a conversation with several people. Switch to group-chat mode for a more accurate participant comparison.", direct_unclear: "I could not separate both people clearly. Add a screenshot showing bubbles from both sides.", group_unclear: "I could not identify enough group participants. Add a screenshot showing at least three people and participant names.", me_unclear: "I could not identify your messages. Upload a screenshot that includes your bubbles.", side_unclear: "I could not determine your message side automatically. Choose left-side or right-side bubbles directly.",
  },
  ja: {
    invalid_request: "リクエスト内容を読み取れませんでした。入力を確認してもう一度お試しください。",
    request_too_large: "アップロード容量が大きすぎます。スクリーンショットの枚数を減らしてください。",
    invalid_context: "分析設定が正しくありません。", invalid_images: "有効なスクリーンショットがありません。5枚以内でアップロードしてください。", text_too_long: "貼り付けた会話が長すぎます。必要な部分に分けてください。", invalid_text: "会話形式を読み取れません。KakaoTalkのコピー形式か「名前: メッセージ」形式で貼り付けてください。", choose_me: "会話の中で自分が誰か選んでください。", processing: "同じ会話をすでに分析しています。", guard_unavailable: "安全な分析接続を確認しています。", rate_limit: "分析リクエストが集中しています。少し後でもう一度お試しください。", daily_budget: "本日分の分析上限に達しました。", analysis_failed: "分析を完了できませんでした。少し後でもう一度お試しください。",
    service_unavailable: "現在、分析サービスを利用できません。少し後でもう一度お試しください。", service_config: "分析サービスの設定を確認しています。少し後でもう一度お試しください。", service_quota: "分析サービスの利用上限に達しています。時間をおいてお試しください。", service_busy: "分析リクエストが一時的に集中しています。", model_unavailable: "選択したAIモデルを一時的に利用できません。", incomplete_output: "AIが最後のまとめを完了できませんでした。入力は残っているので、もう一度分析してください。", looks_group: "複数人の会話に見えます。グループチャットモードに変更すると参加者ごとの流れを正確に見られます。", direct_unclear: "2人の会話を十分に区別できませんでした。左右の吹き出しが見える画像を追加してください。", group_unclear: "グループ参加者を十分に区別できませんでした。3人以上と参加者名が見える画像を追加してください。", me_unclear: "自分が送ったメッセージを区別できませんでした。自分の吹き出しが見える画像を追加してください。", side_unclear: "自分のメッセージ方向を自動判定できませんでした。左側または右側を直接選んでください。",
  },
  zh: {
    invalid_request: "无法读取请求内容。请检查输入后重试。",
    request_too_large: "上传容量过大，请减少截图数量。", invalid_context: "分析设置不正确。", invalid_images: "未找到有效截图，请上传不超过 5 张图片。", text_too_long: "粘贴的对话太长，请分段分析。", invalid_text: "无法识别对话格式。请粘贴 KakaoTalk 复制文本，或使用“姓名: 消息”格式。", choose_me: "请选择对话中哪位是你。", processing: "同一段对话正在分析中。", guard_unavailable: "正在检查安全分析连接。", rate_limit: "分析请求较多，请稍后再试。", daily_budget: "今天可用的分析额度已用完。", analysis_failed: "未能完成分析，请稍后再试。",
    service_unavailable: "分析服务暂时不可用，请稍后再试。", service_config: "正在检查分析服务设置，请稍后再试。", service_quota: "分析服务已达到当前使用上限，请稍后再试。", service_busy: "分析请求暂时较多，请稍后再试。", model_unavailable: "当前选择的 AI 模型暂时不可用。", incomplete_output: "AI 未能完成最后的整理。输入内容仍会保留，请重试。", looks_group: "这看起来是多人对话。切换到群聊模式后，可以更准确地比较每位参与者。", direct_unclear: "无法清楚区分双方对话。请添加一张能看到左右气泡的截图。", group_unclear: "无法识别足够的群聊参与者。请添加一张能看到至少三人及参与者名字的截图。", me_unclear: "无法识别你的消息。请上传包含你所发气泡的截图。", side_unclear: "无法自动判断你的消息方向。请选择左侧或右侧气泡。",
  },
};

export function serverError(locale: Locale, key: ServerErrorKey) {
  return COPY[locale][key];
}

export function mapOpenAIError(error: unknown, locale: Locale) {
  if (!(error instanceof OpenAIError)) return { status: 500, publicMessage: serverError(locale, "analysis_failed") };
  const code = error.code || error.type || "unknown";
  if (code === "api_key_missing") {
    return { status: 503, publicMessage: process.env.NODE_ENV === "development" ? "OPENAI_API_KEY is not configured." : serverError(locale, "service_unavailable") };
  }
  if (error.status === 401) return { status: 503, publicMessage: serverError(locale, "service_config") };
  if (error.status === 429 && ["insufficient_quota", "billing_hard_limit_reached"].includes(code)) return { status: 503, publicMessage: serverError(locale, "service_quota") };
  if (error.status === 429) return { status: 429, publicMessage: serverError(locale, "service_busy") };
  if (error.status === 403) return { status: 503, publicMessage: serverError(locale, "model_unavailable") };
  if (["output_truncated", "incomplete_response", "invalid_json_output"].includes(code)) return { status: 502, publicMessage: serverError(locale, "incomplete_output") };
  return { status: error.status >= 500 ? 502 : 500, publicMessage: serverError(locale, "analysis_failed") };
}

const INTERNAL_TERMS: Record<Locale, Array<[RegExp, string]>> = {
  ko: [[/\bdirect turns?(?: with me)?\b/gi, "나와 직접 주고받은 대화"], [/\bengagement\b/gi, "대화 참여도"], [/\bresponse rate\b/gi, "응답 비율"], [/\binteraction score\b/gi, "상호작용 정도"]],
  en: [[/\bdirect turns?(?: with me)?\b/gi, "direct back-and-forth with you"], [/\binteraction score\b/gi, "interaction level"]],
  ja: [[/\bdirect turns?(?: with me)?\b/gi, "自分との直接のやり取り"], [/\bengagement\b/gi, "会話への参加度"], [/\bresponse rate\b/gi, "返信の割合"], [/\binteraction score\b/gi, "やり取りの多さ"]],
  zh: [[/\bdirect turns?(?: with me)?\b/gi, "与你直接来回的对话"], [/\bengagement\b/gi, "聊天参与度"], [/\bresponse rate\b/gi, "回复比例"], [/\binteraction score\b/gi, "互动程度"]],
};

export function sanitizeUserFacing(value: string, locale: Locale): string {
  let result = value;
  for (const [pattern, replacement] of INTERNAL_TERMS[locale]) result = result.replace(pattern, replacement);

  if (locale === "ko") {
    result = result
      .replace(/상대(?:방)?가\s*(?:너|당신|사용자)를?\s*좋아한다(?:고)?/g, "상대가 대화를 긍정적으로 이어가려는 패턴이 보인다")
      .replace(/(?:분명히|확실히)\s*마음이\s*있(?:다|어)/g, "관심 신호로 해석될 여지는 있다")
      .replace(/질투하고\s*있(?:다|어)/g, "질투로도 해석할 수 있으나 현재 대화만으로는 확정하기 어렵다")
      .replace(/사귀고\s*싶어\s*한(?:다|대)/g, "관계를 더 이어가려는 가능성은 있으나 확정할 수 없다");
  } else if (locale === "en") {
    result = result
      .replace(/definitely (likes|loves) you/gi, "shows patterns that may reflect positive interest in the conversation")
      .replace(/is jealous/gi, "could be read as jealousy, but the chat alone cannot confirm it");
  } else if (locale === "ja") {
    result = result.replace(/あなたのことが確実に好き/g, "会話を前向きに続けようとする傾向が見える").replace(/嫉妬している/g, "嫉妬とも読めますが、この会話だけでは断定できない");
  } else {
    result = result.replace(/肯定喜欢你/g, "表现出愿意积极继续聊天的迹象").replace(/正在嫉妒/g, "可能被理解为嫉妒，但仅凭当前对话无法确认");
  }
  return result.trim();
}
