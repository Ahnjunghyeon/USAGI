"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { parseChatText } from "@/lib/chat-text";
import { inputDraftStorage } from "@/lib/client/storage";
import { AppButton } from "@/components/ui/Button";

export default function ConversationInput() {
  const router = useRouter();
  const [method, setMethod] = useState<"text"|"image">("text");
  const [rawText, setRawText] = useState("");
  const parsed = useMemo(()=> rawText.trim() ? parseChatText(rawText) : null, [rawText]);

  const proceedText = () => {
    if (!parsed) return;
    inputDraftStorage.write({
      method: "text",
      rawText,
      participants: parsed.participants,
      detectedMode: parsed.detectedMode,
    });
    router.push("/analyze/context");
  };

  const proceedImage = () => {
    inputDraftStorage.write({ method: "image", rawText: "", participants: [], detectedMode: "unknown" });
    router.push("/analyze/context");
  };

  return <div className="conversation-input">
    <div className="guide-bunny" aria-hidden="true"><img src="/usagi-focus.png" alt="" width={88} height={88}/></div>
    <div className="guide-copy">
      <strong>대화부터 보여줘봐.</strong>
      <span>카카오톡은 복사해서 붙여넣는 게 가장 빠르고, 캡처만 있어도 괜찮아요.</span>
    </div>

    <div className="input-method-tabs" role="tablist" aria-label="대화 입력 방식">
      <button type="button" className={method==="text"?"selected":""} onClick={()=>setMethod("text")}>📋 텍스트 붙여넣기</button>
      <button type="button" className={method==="image"?"selected":""} onClick={()=>setMethod("image")}>🖼️ 캡처 올리기</button>
    </div>

    {method === "text" ? <>
      <textarea
        className="conversation-textarea"
        value={rawText}
        onChange={(e)=>setRawText(e.target.value)}
        placeholder={`[김우사기] [오전 10:23] 오늘 뭐해?\n[박토끼] [오전 10:24] 그냥 집에 있어ㅋㅋ`}
        spellCheck={false}
      />
      <div className={`parse-feedback ${parsed ? "ok" : ""}`}>
        {rawText.trim() && parsed
          ? <>오, <strong>{parsed.participants.length}명</strong>이 이야기하고 있네요. <strong>대화 {parsed.messages.length}개</strong>를 찾았어요.</>
          : rawText.trim()
          ? <>형식을 아직 읽지 못했어요. 카카오톡에서 복사한 대화를 그대로 붙여넣어 주세요.</>
          : <>카카오톡 복사 형식을 자동으로 읽고 1:1/단체톡을 구분합니다.</>}
      </div>
      <AppButton onClick={proceedText} disabled={!parsed}>이 대화 분석하기</AppButton>
    </> : <>
      <div className="image-method-callout">
        <strong>사진으로 분석할게요.</strong>
        <span>다음 단계에서 관계를 알려주고 캡처를 올리면 됩니다.</span>
      </div>
      <AppButton onClick={proceedImage}>사진으로 계속하기</AppButton>
    </>}
  </div>;
}
