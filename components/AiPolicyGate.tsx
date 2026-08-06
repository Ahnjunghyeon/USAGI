"use client";

import { useEffect, useState } from "react";
import { ButtonLink } from "@/components/ui/Button";
import { useLocale } from "@/components/LocaleProvider";

const CONSENT_KEY = "usagi-ai-policy-consent-v1";

const COPY = {
  ko: { title:"AI가 대화 흐름을 정리해요", body:"결과는 참고용이에요. 민감한 개인정보는 가리고, 사용할 수 있는 대화만 올려주세요.", confirm:"확인했어요", policy:"서비스 안내" },
  en: { title:"AI summarizes conversation patterns", body:"Results are for reference only. Hide sensitive information and only upload chats you may use.", confirm:"Got it", policy:"Service notice" },
  ja: { title:"AIが会話の流れを整理します", body:"結果は参考用です。機微な情報を隠し、利用できる会話だけをアップロードしてください。", confirm:"確認しました", policy:"サービス案内" },
  zh: { title:"AI 会整理对话模式", body:"结果仅供参考。请隐藏敏感信息，并仅上传您有权使用的对话。", confirm:"知道了", policy:"服务说明" },
} as const;

export default function AiPolicyGate() {
  const { locale, ready } = useLocale();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!ready) return;
    setVisible(window.localStorage.getItem(CONSENT_KEY) !== "accepted");
  }, [ready]);

  if (!ready || !visible) return null;
  const c = COPY[locale];

  return <aside className="home-ai-notice" aria-label={c.title}>
    <div className="home-ai-notice-icon" aria-hidden="true">AI</div>
    <div className="home-ai-notice-copy">
      <strong>{c.title}</strong>
      <p>{c.body}</p>
      <div className="home-ai-notice-actions">
        <button type="button" onClick={() => {
          window.localStorage.setItem(CONSENT_KEY, "accepted");
          setVisible(false);
        }}>{c.confirm}</button>
        <ButtonLink href="/policy" variant="ghost" size="sm">{c.policy}</ButtonLink>
      </div>
    </div>
  </aside>;
}
